import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ContributionsService } from '../services/contributions.service';
import { AppError } from '../utils/AppError';

// Injeção de dependência para testes
const contributionsService = (global as any).__CONTRIBUTIONS_SERVICE__ || new ContributionsService();

export class ContributionsController {
  constructor(private service: ContributionsService = contributionsService) {}

  private checkoutSchema = z.object({
    projectId: z.string().cuid(),
    amountCents: z.number().int().min(100),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
  });
  async createCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const parse = this.checkoutSchema.safeParse(req.body);
      if (!parse.success) {
        throw new AppError('ValidationError', 400, parse.error.flatten());
      }

      const userId: string = (req as any).authUserId;
      const result = await this.service.createCheckout(parse.data, userId);
      
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async listByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId;
      if (!projectId) {
        throw new AppError('Project ID is required', 400);
      }
      
      const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
      const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '10'), 10), 1), 50);

      const result = await this.service.listByProject(projectId, page, pageSize);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async hasContributions(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId;
      if (!projectId) {
        throw new AppError('Project ID is required', 400);
      }

      const hasContributions = await this.service.hasContributions(projectId);
      return res.json({ hasContributions });
    } catch (error) {
      return next(error);
    }
  }
}
