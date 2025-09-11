import { Router } from 'express';
import { requireApiAuth } from '../middleware/auth';
import { ContributionsController } from '../controllers/contributions.controller';

const router = Router();
const contributionsController = new ContributionsController();

// POST /api/contributions/checkout (privado)
router.post('/checkout', requireApiAuth, contributionsController.createCheckout.bind(contributionsController));

// GET /api/contributions/project/:projectId (público)
router.get('/project/:projectId', contributionsController.listByProject.bind(contributionsController));

export default router;
