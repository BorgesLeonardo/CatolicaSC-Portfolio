import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { stripe } from './lib/stripe';
import { prisma } from './infrastructure/prisma';
import { errorHandler } from './middleware/error';
import { HealthController } from './controllers/health.controller';

import projectsRouter from './routes/projects';
import projectImagesRouter from './routes/project-images';
import contributionsRouter from './routes/contributions';
import commentsRouter from './routes/comments';
import checkoutRouter from './routes/checkout';
import webhookRouter from './routes/webhook';
import categoriesRouter from './routes/categories';

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:9000',
  credentials: true
}));

/** ---------- Stripe Webhook (raw body) ---------- */
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);

/** ---------- Demais middlewares ---------- */
app.use(express.json());
app.use(clerkMiddleware());

/** ---------- Servir arquivos estáticos ---------- */
app.use('/uploads', express.static('uploads'));

// Health check endpoint
const healthController = new HealthController();
app.get('/api/health', healthController.alive.bind(healthController));
app.get('/health', healthController.alive.bind(healthController));

/** ---------- Rotas ---------- */
app.use('/api/projects', projectsRouter);
app.use('/api/projects', projectImagesRouter);
app.use('/api/contributions', contributionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api', commentsRouter);
app.use('/api', checkoutRouter);

/** ---------- Error Handler ---------- */
app.use(errorHandler);

export default app;
