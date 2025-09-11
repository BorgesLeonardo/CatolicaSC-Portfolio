import { prisma } from '../infrastructure/prisma'
import Stripe from 'stripe'

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

    // Update project raised amount
    await tx.project.update({
      where: { id: projectId },
      data: {
        raisedCents: {
          increment: amountTotal,
        },
      },
    })

    // If this is the first contribution from this user to this project, increment supporters count
    if (userId) {
      const existingContributions = await tx.contribution.count({
        where: {
          projectId,
          contributorId: userId,
          status: 'SUCCEEDED',
        },
      })

      if (existingContributions === 1) {
        await tx.project.update({
          where: { id: projectId },
          data: {
            supportersCount: {
              increment: 1,
            },
          },
        })
      }
    }

    return contribution
  })
}
