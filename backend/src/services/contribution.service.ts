import { prisma } from '../infrastructure/prisma'
import Stripe from 'stripe'
import { projectStatsService } from './project-stats.service'

export const createContributionFromCheckoutSession = async (session: Stripe.Checkout.Session) => {
  const { projectId, userId } = session.metadata || {}
  
  if (!projectId) {
    throw new Error('Project ID not found in session metadata')
  }

  const amountTotal = session.amount_total || 0
  const currency = session.currency || 'brl'
  const paymentIntentId = session.payment_intent as string
  const sessionId = session.id

  // Use transaction to ensure data consistency
  return await prisma.$transaction(async (tx) => {
    // Create or update contribution
    const contribution = await tx.contribution.upsert({
      where: { stripeCheckoutSessionId: sessionId },
      update: {
        status: 'SUCCEEDED',
        stripePaymentIntentId: paymentIntentId,
      },
      create: {
        projectId,
        contributorId: userId || null,
        amountCents: amountTotal,
        currency: currency.toLowerCase(),
        status: 'SUCCEEDED',
        stripeCheckoutSessionId: sessionId,
        stripePaymentIntentId: paymentIntentId,
      },
    })

    return contribution
  })
  
  // Atualiza as estatísticas do projeto de forma consistente
  await projectStatsService.updateProjectStats(projectId)
  
  return contribution
}
