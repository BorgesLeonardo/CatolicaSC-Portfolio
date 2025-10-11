import { Router } from 'express'
import { requireApiAuth } from '../middleware/auth'
import { ConnectController } from '../controllers/connect.controller'

const router = Router()
const connect = new ConnectController()

// POST /api/connect/onboard -> returns account onboarding link
router.post('/connect/onboard', requireApiAuth, connect.onboard.bind(connect))

// GET /api/me/connect/status -> returns connect status
router.get('/me/connect/status', requireApiAuth, connect.status.bind(connect))

// GET /api/me/connect/dashboard-link -> returns express dashboard login link
router.get('/me/connect/dashboard-link', requireApiAuth, connect.dashboardLink.bind(connect))

export default router




