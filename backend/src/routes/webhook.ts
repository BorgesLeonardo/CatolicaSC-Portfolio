import { Router } from 'express'
import { handleStripeWebhook } from '../controllers/webhook.controller'

const router = Router()

// POST /api/webhooks/stripe (app mounts this router at /api/webhooks)
router.post('/stripe', handleStripeWebhook)

export default router
