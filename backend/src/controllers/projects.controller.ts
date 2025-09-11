import { Request, Response } from 'express';
import { z } from 'zod';
import { ProjectsService } from '../services/projects.service';
import { AppError } from '../utils/AppError';

const projectsService = new ProjectsService();

// Schemas de validação
const idParamSchema = z.object({
  id: z.string().cuid({ message: 'id inválido' }),
});

const createProjectSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(5000).optional(),
  goalCents: z.number().int().positive(),
  deadline: z.string().datetime(),
  imageUrl: z.string().url().optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(5000).optional(),
  goalCents: z.number().int().positive().optional(),
  deadline: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
}).refine((b) => Object.values(b).some((v) => v !== undefined), {
  message: 'Envie ao menos um campo para atualização',
});

export class ProjectsController {
  async create(req: Request, res: Response) {
    const parse = createProjectSchema.safeParse(req.body);
    if (!parse.success) {
      throw new AppError('ValidationError', 400, parse.error.flatten());
    }

    const ownerId: string = (req as any).authUserId;
    const project = await projectsService.create(parse.data, ownerId);
    
    return res.status(201).json(project);
  }

  async list(req: Request, res: Response) {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
    const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '10'), 10), 1), 50);
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;
    const active = String(req.query.active ?? '').toLowerCase();

    const filters = {
      page,
      pageSize,
      q,
      ownerId,
      active: active === '1' || active === 'true',
    };

    const result = await projectsService.list(filters);
    return res.json(result);
  }

  async getById(req: Request, res: Response) {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      throw new AppError('ValidationError', 400, params.error.flatten());
    }

    const project = await projectsService.getById(params.data.id);
    return res.json(project);
  }

  async getByOwner(req: Request, res: Response) {
    const ownerId: string = (req as any).authUserId;
    const result = await projectsService.getByOwner(ownerId);
    return res.json(result);
  }

  async update(req: Request, res: Response) {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      throw new AppError('ValidationError', 400, params.error.flatten());
    }

    const body = updateProjectSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError('ValidationError', 400, body.error.flatten());
    }

    const authUserId: string = (req as any).authUserId;
    const updated = await projectsService.update(params.data.id, body.data, authUserId);
    
    return res.json(updated);
  }

  async delete(req: Request, res: Response) {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      throw new AppError('ValidationError', 400, params.error.flatten());
    }

    const authUserId: string = (req as any).authUserId;
    await projectsService.delete(params.data.id, authUserId);
    
    return res.status(204).send();
  }
}
