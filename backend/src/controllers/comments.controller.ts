import { Request, Response } from 'express';
import { z } from 'zod';
import { CommentsService } from '../services/comments.service';
import { AppError } from '../utils/AppError';

const commentsService = new CommentsService();

const idParamProject = z.object({ id: z.string().cuid() });
const createCommentSchema = z.object({ content: z.string().min(1).max(5000) });
const idParamComment = z.object({ commentId: z.string().cuid() });

export class CommentsController {
  async create(req: Request, res: Response) {
    const params = idParamProject.safeParse(req.params);
    if (!params.success) {
      throw new AppError('ValidationError', 400, params.error.flatten());
    }

    const body = createCommentSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError('ValidationError', 400, body.error.flatten());
    }

    const userId: string = (req as any).authUserId;
    const comment = await commentsService.create(params.data.id, body.data, userId);
    
    return res.status(201).json(comment);
  }

  async listByProject(req: Request, res: Response) {
    const params = idParamProject.safeParse(req.params);
    if (!params.success) {
      throw new AppError('ValidationError', 400, params.error.flatten());
    }

    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
    const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '10'), 10), 1), 50);

    const result = await commentsService.listByProject(params.data.id, page, pageSize);
    return res.json(result);
  }

  async delete(req: Request, res: Response) {
    const params = idParamComment.safeParse(req.params);
    if (!params.success) {
      throw new AppError('ValidationError', 400, params.error.flatten());
    }

    const userId: string = (req as any).authUserId;
    await commentsService.delete(params.data.commentId, userId);
    
    return res.status(204).send();
  }
}
