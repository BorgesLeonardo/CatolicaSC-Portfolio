import { Router } from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaignController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);

// Protected routes
router.post('/', authMiddleware, createCampaign);
router.put('/:id', authMiddleware, updateCampaign);
router.delete('/:id', authMiddleware, deleteCampaign);

export default router;
