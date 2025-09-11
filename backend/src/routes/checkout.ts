import { Router } from 'express'
import { createCheckoutSession } from '../controllers/checkout.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

// POST /api/contributions/checkout
router.post('/contributions/checkout', requireAuth, createCheckoutSession)

export default router
