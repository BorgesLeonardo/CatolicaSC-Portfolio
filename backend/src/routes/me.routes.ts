import { Router } from 'express'
import { requireApiAuth } from '../middleware/auth'
import { MeController } from '../controllers/me.controller'

const router = Router()
const me = new MeController()

// KPIs do usuário autenticado
router.get('/me/metrics', requireApiAuth, me.metrics.bind(me))

// Série temporal de contribuições do usuário
router.get('/me/contributions/timeseries', requireApiAuth, me.contributionsTimeseries.bind(me))

// Lista das minhas contribuições
router.get('/me/contributions/list', requireApiAuth, me.contributionsList.bind(me))

// Métricas das minhas campanhas
router.get('/me/campaigns/metrics', requireApiAuth, me.campaignsMetrics.bind(me))

// Lista paginada das minhas campanhas
router.get('/me/campaigns/list', requireApiAuth, me.campaignsList.bind(me))

// Payouts (se aplicável) — implementado de forma segura
router.get('/me/payouts', requireApiAuth, me.payouts.bind(me))

// Minhas assinaturas (recorrências)
router.get('/me/subscriptions', requireApiAuth, me.subscriptionsList.bind(me))

export default router


