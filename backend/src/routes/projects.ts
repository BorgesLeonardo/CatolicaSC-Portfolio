import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { requireApiAuth } from '../middleware/auth';

const router = Router();

/** ---------- Schemas ---------- */

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

/** ---------- Helpers ---------- */

async function assertOwnerOrThrow(projectId: string, userId: string) {
  const found = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, deletedAt: true },
  });
  if (!found || found.deletedAt) {
    const err: any = new Error('NotFound');
    err.status = 404;
    throw err;
  }
  if (found.ownerId !== userId) {
    const err: any = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
}

/** ---------- Criação (privado) ---------- */

router.post('/', requireApiAuth, async (req, res) => {
  const parse = createProjectSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'ValidationError', issues: parse.error.flatten() });
  const { title, description, goalCents, deadline, imageUrl } = parse.data;
  const ownerId: string = (req as any).authUserId;

  await prisma.user.upsert({ where: { id: ownerId }, update: {}, create: { id: ownerId } });

  const project = await prisma.project.create({
    data: { 
      ownerId, 
      title, 
      description: description || null, 
      goalCents, 
      deadline: new Date(deadline), 
      imageUrl: imageUrl || null 
    },
  });
  return res.status(201).json(project);
});

/** ---------- Listagem (pública) com filtros ---------- */
/**
 * GET /api/projects
 * Query:
 *  - q?: string (busca por título, case-insensitive)
 *  - ownerId?: string (Clerk ID)
 *  - active?: "1" | "true"  (deadline >= agora)
 *  - page?: number, pageSize?: number
 */
router.get('/', async (req, res) => {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '10'), 10), 1), 50);
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;
  const active = String(req.query.active ?? '').toLowerCase();

  const where: any = { deletedAt: null };
  if (q) where.title = { contains: q, mode: 'insensitive' };
  if (ownerId) where.ownerId = ownerId;
  if (active === '1' || active === 'true') where.deadline = { gte: new Date() };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.project.count({ where }),
  ]);

  return res.json({ page, pageSize, total, items });
});

/** ---------- Meus projetos (privado) ---------- */
router.get('/mine', requireApiAuth, async (req, res) => {
  const ownerId: string = (req as any).authUserId;
  const items = await prisma.project.findMany({
    where: { ownerId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ items });
});

/** ---------- Detalhe (público) ---------- */
router.get('/:id', async (req, res) => {
  const params = idParamSchema.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: 'ValidationError', issues: params.error.flatten() });

  const project = await prisma.project.findUnique({ where: { id: params.data.id } });
  if (!project || project.deletedAt) return res.status(404).json({ error: 'NotFound' });

  return res.json(project);
});

/** ---------- Edição (privado: dono) ---------- */
router.patch('/:id', requireApiAuth, async (req, res) => {
  const params = idParamSchema.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: 'ValidationError', issues: params.error.flatten() });
  const body = updateProjectSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'ValidationError', issues: body.error.flatten() });

  const { id } = params.data;
  const authUserId: string = (req as any).authUserId;

  try {
    await assertOwnerOrThrow(id, authUserId);
    const data: any = { ...body.data };
    if (data.deadline) data.deadline = new Date(data.deadline);
    const updated = await prisma.project.update({ where: { id }, data });
    return res.json(updated);
  } catch (e: any) {
    if (e.status === 404) return res.status(404).json({ error: 'NotFound' });
    if (e.status === 403) return res.status(403).json({ error: 'Forbidden' });
    return res.status(500).json({ error: 'InternalError' });
  }
});

/** ---------- Exclusão (privado: dono) — SOFT DELETE ---------- */
router.delete('/:id', requireApiAuth, async (req, res) => {
  const params = idParamSchema.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: 'ValidationError', issues: params.error.flatten() });

  const { id } = params.data;
  const authUserId: string = (req as any).authUserId;

  try {
    await assertOwnerOrThrow(id, authUserId);
    await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
    return res.status(204).send();
  } catch (e: any) {
    if (e.status === 404) return res.status(404).json({ error: 'NotFound' });
    if (e.status === 403) return res.status(403).json({ error: 'Forbidden' });
    return res.status(500).json({ error: 'InternalError' });
  }
});

export default router;