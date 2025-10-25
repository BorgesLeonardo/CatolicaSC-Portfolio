import { prisma } from '../infrastructure/prisma'
import Stripe from 'stripe'
import { projectStatsService } from './project-stats.service'
import { broadcastEvent, broadcastToOwner, broadcastToUser } from '../routes/events'

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
  // Broadcast realtime events
  try {
    const payload = {
      type: 'contribution.succeeded',
      projectId,
      userId: userId || null,
      amountCents: amountTotal,
      sessionId,
      paymentIntentId,
      source: 'checkout.session.completed'
    }
    if (userId) broadcastToUser(userId, 'contribution.succeeded', payload)
    broadcastEvent('contribution.succeeded', payload)
  } catch {}
  
  return contribution
}

export const markContributionFailedFromCheckoutSession = async (session: Stripe.Checkout.Session) => {
  const { contributionId } = session.metadata || {}
  const sessionId = session.id

  // Prefer contributionId if present; else use sessionId
  const where: any = contributionId
    ? { id: contributionId }
    : { stripeCheckoutSessionId: sessionId }

  const updated = await prisma.contribution.updateMany({
    where,
    data: { status: 'FAILED' }
  })

  // Update project stats if we could locate a record
  if (updated.count > 0) {
    try {
      const c = await prisma.contribution.findFirst({ where })
      if (c) {
        await projectStatsService.updateProjectStats(c.projectId)
      }
    } catch {}
  }
}

export const markContributionSucceededFromPaymentIntent = async (pi: Stripe.PaymentIntent) => {
  const paymentIntentId = pi.id
  const amountCents = typeof pi.amount_received === 'number' && pi.amount_received > 0
    ? pi.amount_received
    : pi.amount || 0
  const currency = (pi.currency || 'brl').toLowerCase()

  const updated = await prisma.contribution.updateMany({
    where: { stripePaymentIntentId: paymentIntentId },
    data: {
      status: 'SUCCEEDED',
      amountCents,
      currency
    }
  })

  if (updated.count > 0) {
    try {
      const c = await prisma.contribution.findFirst({ where: { stripePaymentIntentId: paymentIntentId } })
      if (c) {
        await projectStatsService.updateProjectStats(c.projectId)
        try {
          const payload = {
            type: 'contribution.succeeded',
            projectId: c.projectId,
            userId: c.contributorId,
            amountCents,
            paymentIntentId,
            source: 'payment_intent.succeeded'
          }
          if (c.contributorId) broadcastToUser(c.contributorId, 'contribution.succeeded', payload)
          broadcastEvent('contribution.succeeded', payload)
        } catch {}
      }
    } catch {}
  }
}

export const markContributionFailedFromPaymentIntent = async (pi: Stripe.PaymentIntent) => {
  const paymentIntentId = pi.id

  const updated = await prisma.contribution.updateMany({
    where: { stripePaymentIntentId: paymentIntentId },
    data: { status: 'FAILED' }
  })

  if (updated.count > 0) {
    try {
      const c = await prisma.contribution.findFirst({ where: { stripePaymentIntentId: paymentIntentId } })
      if (c) {
        await projectStatsService.updateProjectStats(c.projectId)
      }
    } catch {}
  }
}

export const markContributionRefundedFromRefund = async (refund: Stripe.Refund) => {
  // Prefer payment_intent when available
  const paymentIntentId = (refund.payment_intent as string) || undefined
  if (!paymentIntentId) {
    return
  }

  const updated = await prisma.contribution.updateMany({
    where: { stripePaymentIntentId: paymentIntentId },
    data: { status: 'REFUNDED' }
  })

  if (updated.count > 0) {
    try {
      const c = await prisma.contribution.findFirst({ where: { stripePaymentIntentId: paymentIntentId } })
      if (c) {
        await projectStatsService.updateProjectStats(c.projectId)
      }
    } catch {}
  }
}

export const markContributionRefundedFromCharge = async (charge: Stripe.Charge) => {
  const paymentIntentId = (charge.payment_intent as string) || undefined
  if (!paymentIntentId) return

  const updated = await prisma.contribution.updateMany({
    where: { stripePaymentIntentId: paymentIntentId },
    data: { status: 'REFUNDED' }
  })

  if (updated.count > 0) {
    try {
      const c = await prisma.contribution.findFirst({ where: { stripePaymentIntentId: paymentIntentId } })
      if (c) {
        await projectStatsService.updateProjectStats(c.projectId)
      }
    } catch {}
  }
}
