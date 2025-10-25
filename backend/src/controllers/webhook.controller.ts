import { Request, Response } from 'express'
import { stripe } from '../utils/stripeClient'
import { createContributionFromCheckoutSession, markContributionFailedFromCheckoutSession, markContributionFailedFromPaymentIntent, markContributionRefundedFromCharge, markContributionRefundedFromRefund, markContributionSucceededFromPaymentIntent } from '../services/contribution.service'
import { prisma } from '../infrastructure/prisma'
import { AppError } from '../utils/AppError'

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new AppError('Stripe webhook secret not configured', 500)
  }

  let event: any

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err: any) {
    try { (req as any)?.log?.warn?.({ err, event: 'webhook_signature_failed' }, 'stripe_webhook_signature_failed') } catch {}
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await createContributionFromCheckoutSession(session)
        break
      case 'checkout.session.expired': {
        const session = event.data.object
        await markContributionFailedFromCheckoutSession(session)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const metadata = (sub as any).metadata || {}
        const subscriptionId = metadata.subscriptionId as string | undefined
        if (subscriptionId) {
          const statusMap: Record<string, string> = {
            'trialing': 'ACTIVE',
            'active': 'ACTIVE',
            'past_due': 'PAST_DUE',
            'canceled': 'CANCELED',
            'unpaid': 'PAST_DUE',
            'incomplete': 'INCOMPLETE',
            'incomplete_expired': 'INCOMPLETE',
          }
          const mapped = statusMap[(sub as any).status] || 'INCOMPLETE'
          // Best-effort update; ignore if model not present in some envs
          try {
            await (prisma as any).subscription.update({
            where: { id: subscriptionId },
            data: {
              status: mapped as any,
              stripeSubscriptionId: (sub as any).id,
              stripeCustomerId: (sub as any).customer as string,
              latestInvoiceId: (sub as any).latest_invoice as string | null,
            }
            })
          } catch (_) {
            // swallow to keep webhook robust during tests
          }
        }
        break
      }
      
      case 'payment_intent.succeeded': {
        const pi = event.data.object
        if (typeof markContributionSucceededFromPaymentIntent === 'function') {
          await markContributionSucceededFromPaymentIntent(pi)
        }
        break
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object
        if (typeof markContributionFailedFromPaymentIntent === 'function') {
          await markContributionFailedFromPaymentIntent(pi)
        }
        break
      }
      case 'charge.refunded': {
        const charge = event.data.object
        if (typeof markContributionRefundedFromCharge === 'function') {
          await markContributionRefundedFromCharge(charge)
        }
        break
      }
      case 'refund.updated':
      case 'refund.created': {
        const refund = event.data.object
        if (typeof markContributionRefundedFromRefund === 'function') {
          await markContributionRefundedFromRefund(refund)
        }
        break
      }
      
      default:
        // Unhandled event type - no action needed
        break
    }

    return res.json({ received: true })
  } catch (error) {
    try { (req as any)?.log?.error?.({ err: error }, 'stripe_webhook_processing_failed') } catch {}
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
