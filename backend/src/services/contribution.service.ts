import { prisma } from '../infrastructure/prisma'
import Stripe from 'stripe'
import { projectStatsService } from './project-stats.service'

export const createContributionFromCheckoutSession = async (session: Stripe.Checkout.Session) => {
  const { projectId, userId, contributionId } = session.metadata || {}
  
  if (!projectId) {
    throw new Error('Project ID not found in session metadata')
  }

  const amountTotal = session.amount_total || 0
  const currency = session.currency || 'brl'
  const paymentIntentId = session.payment_intent as string
  const sessionId = session.id

  // Use transaction to ensure data consistency
  const contribution = await prisma.$transaction(async (tx) => {
    // If we already created a PENDING contribution, update it
    if (contributionId) {
      const data: any = {
        status: 'SUCCEEDED',
        amountCents: amountTotal,
        currency: currency.toLowerCase(),
        stripePaymentIntentId: paymentIntentId,
        stripeCheckoutSessionId: sessionId,
      }
      if (userId) data.contributorId = userId
      const updated = await tx.contribution.update({
        where: { id: contributionId },
        data
      })
      return updated
    }

    // Fallback: create new if nothing exists
    const created = await tx.contribution.create({
      data: {
        projectId,
        contributorId: userId || null,
        amountCents: amountTotal,
        currency: currency.toLowerCase(),
        status: 'SUCCEEDED',
        stripeCheckoutSessionId: sessionId,
        stripePaymentIntentId: paymentIntentId,
      }
    })
    return created
  })
  
  // Atualiza as estatísticas do projeto de forma consistente
  await projectStatsService.updateProjectStats(projectId)
  
  return contribution
}
