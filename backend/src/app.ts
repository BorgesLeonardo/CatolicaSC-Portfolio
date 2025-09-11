import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { stripe } from './lib/stripe';
import { prisma } from './infrastructure/prisma';
import { errorHandler } from './middleware/error';
import { HealthController } from './controllers/health.controller';

import projectsRouter from './routes/projects';
import contributionsRouter from './routes/contributions';
import commentsRouter from './routes/comments';
import checkoutRouter from './routes/checkout';
import webhookRouter from './routes/webhook';

const app = express();
app.use(cors());

/** ---------- Stripe Webhook (raw body) ---------- */
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);

/** ---------- Demais middlewares ---------- */
app.use(express.json());
app.use(clerkMiddleware());

const healthController = new HealthController();
app.get('/health', healthController.alive.bind(healthController));

/** ---------- Rotas ---------- */
app.use('/api/projects', projectsRouter);
app.use('/api/contributions', contributionsRouter);
app.use('/api', commentsRouter);
app.use('/api', checkoutRouter);

/** ---------- Error Handler ---------- */
app.use(errorHandler);

export default app;
