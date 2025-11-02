import { Router } from 'express';
import { requireApiAuth } from '../middleware/auth';
import { SubscriptionsController } from '../controllers/subscriptions.controller';

const router = Router();
const controller = new SubscriptionsController();

// POST /api/subscriptions/checkout (privado)
router.post('/subscriptions/checkout', requireApiAuth, controller.createCheckout.bind(controller));

// DELETE /api/subscriptions/:id (privado)
router.delete('/subscriptions/:id', requireApiAuth, controller.cancel.bind(controller));

export default router;






















