import { Router } from 'express';
import {
  createSupport,
  getSupportsByCampaign,
  getSupportsByUser
} from '../controllers/supportController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/campaign/:campaignId', getSupportsByCampaign);

// Protected routes
router.post('/', authMiddleware, createSupport);
router.get('/user', authMiddleware, getSupportsByUser);

export default router;
