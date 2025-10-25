import { Request, Response } from 'express'
import { stripe } from '../utils/stripeClient'
import { prisma } from '../infrastructure/prisma'
import { AppError } from '../utils/AppError'

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { projectId, amount, currency, successUrl, cancelUrl } = req.body

    // Validate required fields
    if (!projectId || !amount || !currency || !successUrl || !cancelUrl) {
      throw new AppError('Missing required fields', 400)
    }

    // Validate amount
    if (amount < 500) { // Minimum 5 BRL in cents
      throw new AppError('Amount must be at least R$ 5.00', 400)
    }

    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
      }
    })

    if (!project) {
      throw new AppError('Project not found', 404)
    }

    // Get user ID from auth (if available)
    const userId = (req as any).authUserId

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: amount,
            product_data: {
              name: project.title,
              description: project.description || 'Contribuição para campanha',
              ...(project.imageUrl && { images: [project.imageUrl] }),
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        projectId,
        ...(userId && { userId }),
      },
    })

    return res.json({ id: session.id })
  } catch (error) {
    try { (req as any)?.log?.error?.({ err: error }, 'checkout_session_create_failed') } catch {}
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message })
    }

    return res.status(500).json({ message: 'Internal server error' })
  }
}
