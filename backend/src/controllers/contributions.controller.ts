import { Request, Response } from 'express';
import { z } from 'zod';
import { ContributionsService } from '../services/contributions.service';
import { AppError } from '../utils/AppError';

const contributionsService = new ContributionsService();

const checkoutSchema = z.object({
  projectId: z.string().cuid(),
  amountCents: z.number().int().min(100),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export class ContributionsController {
  async createCheckout(req: Request, res: Response) {
    const parse = checkoutSchema.safeParse(req.body);
    if (!parse.success) {
      throw new AppError('ValidationError', 400, parse.error.flatten());
    }

    const userId: string = (req as any).authUserId;
    const result = await contributionsService.createCheckout(parse.data, userId);
    
    return res.status(201).json(result);
  }

  async listByProject(req: Request, res: Response) {
    const projectId = req.params.projectId;
    if (!projectId) {
      throw new AppError('Project ID is required', 400);
    }
    
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
    const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '10'), 10), 1), 50);

    const result = await contributionsService.listByProject(projectId, page, pageSize);
    return res.json(result);
  }
}
