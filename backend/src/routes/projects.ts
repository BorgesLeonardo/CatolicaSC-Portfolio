import { Router } from 'express';
import { requireApiAuth } from '../middleware/auth';
import { ProjectsController } from '../controllers/projects.controller';
import { createProjectLimiter } from '../middleware/rateLimit';
import { idempotencyMiddleware } from '../middleware/idempotency';

const router = Router();
const projectsController = new ProjectsController();

/** ---------- Criação (privado) ---------- */
router.post('/', createProjectLimiter, idempotencyMiddleware, requireApiAuth, projectsController.create.bind(projectsController));

/** ---------- Listagem (pública) com filtros ---------- */
/**
 * GET /api/projects
 * Query:
 *  - q?: string (busca por título, case-insensitive)
 *  - ownerId?: string (Clerk ID)
 *  - active?: "1" | "true"  (deadline >= agora)
 *  - page?: number, pageSize?: number
 */
router.get('/', projectsController.list.bind(projectsController));

/** ---------- Meus projetos (privado) ---------- */
router.get('/mine', requireApiAuth, projectsController.getByOwner.bind(projectsController));

/** ---------- Detalhe (público) ---------- */
router.get('/:id', projectsController.getById.bind(projectsController));

/** ---------- Edição (privado: dono) ---------- */
router.patch('/:id', requireApiAuth, projectsController.update.bind(projectsController));

/** ---------- Exclusão (privado: dono) — SOFT DELETE ---------- */
router.delete('/:id', requireApiAuth, projectsController.delete.bind(projectsController));

/** ---------- Atualizar estatísticas (público) ---------- */
router.post('/update-stats', projectsController.updateAllStats.bind(projectsController));

export default router;