import { Router } from 'express'
import { createCheckoutSession } from '../controllers/checkout.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// POST /api/contributions/checkout
router.post('/contributions/checkout', authMiddleware, createCheckoutSession)

export default router
