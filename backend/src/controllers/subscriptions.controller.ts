import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SubscriptionsService, subscriptionsService } from '../services/subscriptions.service';
import { AppError } from '../utils/AppError';

export class SubscriptionsController {
  constructor(private service: SubscriptionsService = subscriptionsService) {}

  private checkoutSchema = z.object({
    projectId: z.string().cuid(),
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
}















