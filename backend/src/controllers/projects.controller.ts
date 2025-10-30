import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProjectsService } from '../services/projects.service';
import { projectStatsService } from '../services/project-stats.service';
import { AppError } from '../utils/AppError';
import { createCampaignSchema } from '../schemas/campaign';
import { sanitizeHtml } from '../utils/sanitize';
import { prisma } from '../infrastructure/prisma';
import { stripe } from '../utils/stripeClient';

// Injeção de dependência para testes
const projectsService = (global as any).__PROJECTS_SERVICE__ || new ProjectsService();

export class ProjectsController {
  constructor(private service: ProjectsService = projectsService) {}

  // Schemas de validação
  private idParamSchema = z.object({
    id: z.string().cuid({ message: 'id inválido' }),
  });

  // Server-side strong schema
  private createProjectSchema = createCampaignSchema;

  private updateProjectSchema = z.object({
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(120, 'Título deve ter no máximo 120 caracteres').optional(),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(5000, 'Descrição deve ter no máximo 5000 caracteres').optional(),
    goalCents: z.number().int().positive('Meta deve ser um valor positivo').optional(),
    deadline: z.string().datetime('Data limite deve ser uma data válida').optional(),
    imageUrl: z.string().optional(),
    videoUrl: z.string().url('Informe uma URL de vídeo válida').optional(),
    categoryId: z.string().cuid('Categoria deve ser válida').optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  }).refine((b) => Object.values(b).some((v) => v !== undefined), {
    message: 'Envie ao menos um campo para atualização',
  });
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Define um deadline padrão para campanhas recorrentes quando não informado pelo frontend
      const shouldDefaultEndsAt =
        (!req.body.deadline && !req.body.endsAt) && req.body.fundingType === 'RECURRING';

      const defaultEndsAt = shouldDefaultEndsAt
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : undefined;

      const parse = this.createProjectSchema.safeParse({
        ...req.body,
        // allow incoming ISO strings for endsAt
        endsAt: req.body.deadline ? new Date(req.body.deadline) : (req.body.endsAt || defaultEndsAt),
      });
      if (!parse.success) {
        throw new AppError('ValidationError', 422, parse.error.flatten());
      }

      const ownerId: string = (req as any).authUserId;

      // Block creation when the user is not connected to Stripe
      const user = await prisma.user.findUnique({ where: { id: ownerId } });
      const accountId = user?.stripeAccountId || null;
      if (!accountId) {
        throw new AppError('Conecte sua conta Stripe para criar campanhas', 422);
      }
      try {
        const account = await stripe.accounts.retrieve(accountId);
        const chargesEnabled = !!(account as any).charges_enabled;
        const payoutsEnabled = !!(account as any).payouts_enabled;
        if (!chargesEnabled || !payoutsEnabled) {
          throw new AppError('Habilite recebimentos no Stripe para criar campanhas', 422);
        }
      } catch (err: any) {
        const msg = String(err?.message || '');
        const code = String((err?.raw as any)?.code || (err as any)?.code || '');
        const isMissing = msg.includes('No such account') || msg.includes('does not have access to account') || code === 'resource_missing' || code === 'account_invalid';
        if (isMissing) {
          try { await prisma.user.update({ where: { id: ownerId }, data: { stripeAccountId: null } }); } catch {}
          throw new AppError('Conecte sua conta Stripe para criar campanhas', 422);
        }
        throw err;
      }
      const data = parse.data as any;

      // Additional server-side range enforcement by funding type
      if (data.fundingType === 'DIRECT') {
        if (typeof data.goalCents !== 'number' || data.goalCents < 1000 || data.goalCents > 100_000_000) {
          throw new AppError('ValidationError', 422, { fieldErrors: { goalCents: ['Meta fora da faixa permitida'] } });
        }
        if (data.subscriptionEnabled) {
          throw new AppError('ValidationError', 422, { fieldErrors: { subscriptionEnabled: ['Assinatura não é permitida para campanhas de pagamento direto'] } });
        }
      } else if (data.fundingType === 'RECURRING') {
        if (!data.subscriptionPriceCents || !data.subscriptionInterval) {
          throw new AppError('ValidationError', 422, { fieldErrors: { subscriptionPriceCents: ['Informe o preço da assinatura'], subscriptionInterval: ['Informe o intervalo da assinatura'] } });
        }
      }
      if (typeof data.minContributionCents === 'number' && data.minContributionCents < 500) {
        throw new AppError('ValidationError', 422, { fieldErrors: { minContributionCents: ['Mínimo de contribuição deve ser pelo menos R$ 5,00'] } });
      }
      const sanitizedDescription = sanitizeHtml(data.description);

      const project = await this.service.create({
        title: data.title.trim(),
        description: sanitizedDescription,
        goalCents: data.fundingType === 'DIRECT' ? data.goalCents : undefined,
        fundingType: data.fundingType,
        deadline: data.endsAt.toISOString(),
        categoryId: data.categoryId,
        minContributionCents: data.minContributionCents,
        subscriptionEnabled: data.fundingType === 'RECURRING' ? true : false,
        subscriptionPriceCents: data.fundingType === 'RECURRING' ? (data as any).subscriptionPriceCents : undefined,
        subscriptionInterval: data.fundingType === 'RECURRING' ? (data as any).subscriptionInterval : undefined,
      }, ownerId);
      
      return res.status(201).json(project);
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
      const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '10'), 10), 1), 50);
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;
      const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
      const active = String(req.query.active ?? '').toLowerCase();

      const filters = {
        page,
        pageSize,
        q,
        ownerId,
        categoryId,
        active: active === '1' || active === 'true',
      };

      const result = await this.service.list(filters);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const project = await this.service.getById(params.data.id);
      return res.json(project);
    } catch (error) {
      return next(error);
    }
  }

  async getByOwner(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId: string = (req as any).authUserId;
      const result = await this.service.getByOwner(ownerId);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      // noop: removed debug log
      // removed debug payload

      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        // noop: removed debug log
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const body = this.updateProjectSchema.safeParse(req.body);
      if (!body.success) {
        // noop: removed debug log
        throw new AppError('ValidationError', 400, body.error.flatten());
      }

      // noop: removed debug log

      const authUserId: string = (req as any).authUserId;
      const updated = await this.service.update(params.data.id, body.data, authUserId);
      
      // noop: removed debug log
      return res.json(updated);
    } catch (error) {
      // noop: removed debug log
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const authUserId: string = (req as any).authUserId;
      await this.service.delete(params.data.id, authUserId);
      
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  async updateAllStats(req: Request, res: Response, next: NextFunction) {
    try {
      await projectStatsService.updateAllProjectsStats()
      
      return res.json({ 
        message: 'Estatísticas atualizadas com sucesso',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      // noop: removed debug log
      return next(error)
    }
  }
}
