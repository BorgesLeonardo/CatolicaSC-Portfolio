import { Router } from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaignController';
import { authMiddleware } from '../middlewares/auth';
import { generalRateLimit } from '../middlewares/security';
import { 
  validateCampaign, 
  validateCampaignUpdate, 
  validateId, 
  validatePagination, 
  validateSearch 
} from '../middlewares/validation';

const router = Router();

// Public routes with validation
router.get('/', validatePagination, validateSearch, getCampaigns);
router.get('/:id', validateId, getCampaignById);

// Protected routes with rate limiting and validation
router.post('/', generalRateLimit, authMiddleware, validateCampaign, createCampaign);
router.put('/:id', generalRateLimit, authMiddleware, validateId, validateCampaignUpdate, updateCampaign);
router.delete('/:id', generalRateLimit, authMiddleware, validateId, deleteCampaign);

export default router;
