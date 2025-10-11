import { Router } from 'express';
import { requireApiAuth } from '../middleware/auth';
import { SubscriptionsController } from '../controllers/subscriptions.controller';

const router = Router();
const controller = new SubscriptionsController();

// POST /api/subscriptions/checkout (privado)
router.post('/subscriptions/checkout', requireApiAuth, controller.createCheckout.bind(controller));

export default router;















