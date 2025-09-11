import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CommentsService } from '../services/comments.service';
import { AppError } from '../utils/AppError';

// Injeção de dependência para testes
const commentsService = (global as any).__COMMENTS_SERVICE__ || new CommentsService();

export class CommentsController {
  constructor(private service: CommentsService = commentsService) {}

  private idParamProject = z.object({ id: z.string().cuid() });
  private createCommentSchema = z.object({ content: z.string().min(1).max(5000) });
  private idParamComment = z.object({ commentId: z.string().cuid() });
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamProject.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const body = this.createCommentSchema.safeParse(req.body);
      if (!body.success) {
        throw new AppError('ValidationError', 400, body.error.flatten());
      }

      const userId: string = (req as any).authUserId;
      const comment = await this.service.create(params.data.id, body.data, userId);
      
      return res.status(201).json(comment);
    } catch (error) {
      return next(error);
    }
  }

  async listByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamProject.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
      const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '10'), 10), 1), 50);

      const result = await this.service.listByProject(params.data.id, page, pageSize);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamComment.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const userId: string = (req as any).authUserId;
      await this.service.delete(params.data.commentId, userId);
      
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}
