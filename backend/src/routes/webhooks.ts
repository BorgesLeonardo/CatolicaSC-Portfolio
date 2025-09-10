import { Router } from 'express';
import { handleClerkWebhook, testWebhook } from '../controllers/webhookController';

const router = Router();

/**
 * POST /api/webhooks/clerk
 * Webhook do Clerk para sincronização de usuários
 */
router.post('/clerk', handleClerkWebhook);

/**
 * POST /api/webhooks/test
 * Endpoint para testar webhook (apenas desenvolvimento)
 */
router.post('/test', testWebhook);

export default router;

