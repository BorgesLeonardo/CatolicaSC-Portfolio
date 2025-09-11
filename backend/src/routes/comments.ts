import { Router } from 'express';
import { requireApiAuth } from '../middleware/auth';
import { CommentsController } from '../controllers/comments.controller';

const router = Router();
const commentsController = new CommentsController();

// POST /api/projects/:id/comments  (privado)
router.post('/projects/:id/comments', requireApiAuth, commentsController.create.bind(commentsController));

// GET /api/projects/:id/comments  (público)
router.get('/projects/:id/comments', commentsController.listByProject.bind(commentsController));

// DELETE /api/comments/:commentId (privado: autor OU dono do projeto)
router.delete('/comments/:commentId', requireApiAuth, commentsController.delete.bind(commentsController));

export default router;
