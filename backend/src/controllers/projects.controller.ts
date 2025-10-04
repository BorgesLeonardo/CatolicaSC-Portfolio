import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProjectsService } from '../services/projects.service';
import { projectStatsService } from '../services/project-stats.service';
import { AppError } from '../utils/AppError';
import { createCampaignSchema } from '../schemas/campaign';
import { sanitizeHtml } from '../utils/sanitize';

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
    categoryId: z.string().cuid('Categoria deve ser válida').optional(),
  }).refine((b) => Object.values(b).some((v) => v !== undefined), {
    message: 'Envie ao menos um campo para atualização',
  });
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parse = this.createProjectSchema.safeParse({
        ...req.body,
        // allow incoming ISO strings for endsAt
        endsAt: req.body.deadline ? new Date(req.body.deadline) : req.body.endsAt,
      });
      if (!parse.success) {
        throw new AppError('ValidationError', 422, parse.error.flatten());
      }

      const ownerId: string = (req as any).authUserId;
      const data = parse.data as any;

      // Additional server-side range enforcement
      if (data.goalCents < 1000 || data.goalCents > 100_000_000) {
        throw new AppError('ValidationError', 422, { fieldErrors: { goalCents: ['Meta fora da faixa permitida'] } });
      }
      if (typeof data.minContributionCents === 'number' && data.minContributionCents < 500) {
        throw new AppError('ValidationError', 422, { fieldErrors: { minContributionCents: ['Mínimo de contribuição deve ser pelo menos R$ 5,00'] } });
      }
      const sanitizedDescription = sanitizeHtml(data.description);

      const project = await this.service.create({
        title: data.title.trim(),
        description: sanitizedDescription,
        goalCents: data.goalCents,
        deadline: data.endsAt.toISOString(),
        categoryId: data.categoryId,
        minContributionCents: data.minContributionCents,
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
      console.log('📨 Update request received:', { 
        params: req.params, 
        body: req.body,
        authUserId: (req as any).authUserId 
      });

      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        console.error('❌ Params validation failed:', params.error.flatten());
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const body = this.updateProjectSchema.safeParse(req.body);
      if (!body.success) {
        console.error('❌ Body validation failed:', body.error.flatten());
        throw new AppError('ValidationError', 400, body.error.flatten());
      }

      console.log('✅ Validation passed:', { params: params.data, body: body.data });

      const authUserId: string = (req as any).authUserId;
      const updated = await this.service.update(params.data.id, body.data, authUserId);
      
      console.log('✅ Update completed successfully');
      return res.json(updated);
    } catch (error) {
      console.error('❌ Update error:', error);
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
      console.error('❌ Erro ao atualizar estatísticas:', error)
      return next(error)
    }
  }
}
