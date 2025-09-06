import { Router } from 'express';
import {
  createComment,
  getCommentsByCampaign,
  updateComment,
  deleteComment
} from '../controllers/commentController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/campaign/:campaignId', getCommentsByCampaign);

// Protected routes
router.post('/', authMiddleware, createComment);
router.put('/:id', authMiddleware, updateComment);
router.delete('/:id', authMiddleware, deleteComment);

export default router;
