import { Router } from 'express'
import { handleStripeWebhook } from '../controllers/webhook.controller'

const router = Router()

// POST /api/webhooks/stripe
router.post('/webhooks/stripe', handleStripeWebhook)

export default router
