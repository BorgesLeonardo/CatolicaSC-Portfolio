import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireApiAuth } from '../middleware/auth';

const router = Router();

const idParamProject = z.object({ id: z.string().cuid() });
const createCommentSchema = z.object({ content: z.string().min(1).max(5000) });
const idParamComment = z.object({ commentId: z.string().cuid() });

// POST /api/projects/:id/comments  (privado)
router.post('/projects/:id/comments', requireApiAuth, async (req, res) => {
  const params = idParamProject.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: 'ValidationError', issues: params.error.flatten() });
  const body = createCommentSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'ValidationError', issues: body.error.flatten() });

  const project = await prisma.project.findUnique({ where: { id: params.data.id } });
  if (!project || project.deletedAt) return res.status(404).json({ error: 'ProjectNotFound' });

  const userId: string = (req as any).authUserId;
  await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });

  const comment = await prisma.comment.create({
    data: {
      projectId: project.id,
      authorId: userId,
      content: body.data.content,
    },
  });
  return res.status(201).json(comment);
});

// GET /api/projects/:id/comments  (público)
router.get('/projects/:id/comments', async (req, res) => {
  const params = idParamProject.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: 'ValidationError', issues: params.error.flatten() });

  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '10'), 10), 1), 50);

  const where = { projectId: params.data.id };
  const [items, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.comment.count({ where }),
  ]);
  return res.json({ page, pageSize, total, items });
});

// DELETE /api/comments/:commentId (privado: autor OU dono do projeto)
router.delete('/comments/:commentId', requireApiAuth, async (req, res) => {
  const params = idParamComment.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: 'ValidationError', issues: params.error.flatten() });

  const userId: string = (req as any).authUserId;
  const comment = await prisma.comment.findUnique({
    where: { id: params.data.commentId },
    include: { project: true },
  });
  if (!comment) return res.status(404).json({ error: 'NotFound' });

  const isAuthor = comment.authorId === userId;
  const isProjectOwner = comment.project.ownerId === userId;
  if (!isAuthor && !isProjectOwner) return res.status(403).json({ error: 'Forbidden' });

  await prisma.comment.delete({ where: { id: comment.id } });
  return res.status(204).send();
});

export default router;
