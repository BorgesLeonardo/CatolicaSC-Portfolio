import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { stripe } from './lib/stripe';
import { prisma } from './lib/prisma';

import projectsRouter from './routes/projects';
import contributionsRouter from './routes/contributions';
import commentsRouter from './routes/comments';

const app = express();
app.use(cors());

/** ---------- Stripe Webhook (raw body) ---------- */
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).send('Missing webhook secret');

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const contributionId = session?.metadata?.contributionId as string | undefined;
        if (contributionId) {
          await prisma.contribution.update({
            where: { id: contributionId },
            data: {
              status: 'SUCCEEDED',
              stripePaymentIntentId: session.payment_intent?.toString() ?? null,
              stripeCheckoutSessionId: session.id,
            },
          });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any;
        const contrib = await prisma.contribution.findFirst({ where: { stripePaymentIntentId: pi.id } });
        if (contrib) {
          await prisma.contribution.update({ where: { id: contrib.id }, data: { status: 'FAILED' } });
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as any;
        if (charge.payment_intent) {
          const contrib = await prisma.contribution.findFirst({ where: { stripePaymentIntentId: charge.payment_intent.toString() } });
          if (contrib) {
            await prisma.contribution.update({ where: { id: contrib.id }, data: { status: 'REFUNDED' } });
          }
        }
        break;
      }
      default:
        // ignore outros eventos
        break;
    }
    return res.json({ received: true });
  } catch (e) {
    return res.status(500).json({ error: 'WebhookHandlingError' });
  }
});

/** ---------- Demais middlewares ---------- */
app.use(express.json());
app.use(clerkMiddleware());

app.get('/health', (_req, res) => res.json({ ok: true }));

/** ---------- Rotas ---------- */
app.use('/api/projects', projectsRouter);
app.use('/api/contributions', contributionsRouter);
app.use('/api', commentsRouter);

export default app;
