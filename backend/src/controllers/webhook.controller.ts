import { Request, Response } from 'express'
import { stripe } from '../utils/stripeClient'
import { createContributionFromCheckoutSession } from '../services/contribution.service'
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
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await createContributionFromCheckoutSession(session)
        break
      
      case 'payment_intent.succeeded':
        // Payment succeeded - no action needed
        break
      
      case 'payment_intent.payment_failed':
        // Payment failed - no action needed
        break
      
      default:
        // Unhandled event type - no action needed
        break
    }

    return res.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
