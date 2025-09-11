import { Router } from 'express';
import { z } from 'zod';
import { requireApiAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { stripe } from '../lib/stripe';

const router = Router();

const checkoutSchema = z.object({
  projectId: z.string().cuid(),
  amountCents: z.number().int().min(100),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

// POST /api/contributions/checkout (privado)
router.post('/checkout', requireApiAuth, async (req, res) => {
  const parse = checkoutSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'ValidationError', issues: parse.error.flatten() });

  const { projectId, amountCents, successUrl, cancelUrl } = parse.data;
  const userId: string = (req as any).authUserId;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.deletedAt) return res.status(404).json({ error: 'ProjectNotFound' });
  if (project.deadline < new Date()) return res.status(400).json({ error: 'ProjectClosed' });

  // garante Usuario local
  await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });

  // cria contribution PENDING
  const contribution = await prisma.contribution.create({
    data: {
      projectId,
      contributorId: userId,
      amountCents,
      currency: process.env.STRIPE_CURRENCY || 'BRL',
      status: 'PENDING',
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: process.env.STRIPE_CURRENCY || 'BRL',
        unit_amount: amountCents,
        product_data: {
          name: `Contribuição: ${project.title}`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      contributionId: contribution.id,
      projectId: project.id,
      ownerId: project.ownerId,
    },
    success_url: successUrl ?? `${process.env.APP_BASE_URL}/contrib/success?c=${contribution.id}`,
    cancel_url:  cancelUrl  ?? `${process.env.APP_BASE_URL}/contrib/cancel?c=${contribution.id}`,
  });

  await prisma.contribution.update({
    where: { id: contribution.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return res.status(201).json({ checkoutUrl: session.url, contributionId: contribution.id });
});

export default router;
