import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import { clerkMiddleware } from '@clerk/express';
import { nanoid } from 'nanoid';
import { prisma } from './infrastructure/prisma';
import { maskEmail, maskCpfCnpj } from './utils/sanitize';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error';
import { HealthController } from './controllers/health.controller';

import projectsRouter from './routes/projects';
import projectImagesRouter from './routes/project-images';
import projectVideosRouter from './routes/project-videos';
import contributionsRouter from './routes/contributions';
import subscriptionsRouter from './routes/subscriptions';
import commentsRouter from './routes/comments';
import checkoutRouter from './routes/checkout';
import webhookRouter from './routes/webhook';
import categoriesRouter from './routes/categories';
import meRouter from './routes/me.routes'
import connectRouter from './routes/connect'
import eventsRouter from './routes/events'
import { apiLimiter } from './middleware/rateLimit';

const app = express();

// Security: hide tech stack, trust proxy for HTTPS headers
app.disable('x-powered-by');
app.set('trust proxy', 1);

// CORS configuration (strict)
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:9000',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Idempotency-Key','X-Requested-With','X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400,
}));

// Security headers, query param pollution protection, compression
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: process.env.CSP_DISABLED === 'true' ? false : {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://js.stripe.com',
        'https://*.clerk.com',
        'https://*.clerk.services',
      ],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        process.env.FRONTEND_ORIGIN || 'http://localhost:9000',
        'https://images.unsplash.com',
        'https://*.clerk.com',
        'https://*.clerk.services',
      ],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      connectSrc: [
        "'self'",
        process.env.FRONTEND_ORIGIN || 'http://localhost:9000',
        'https://api.stripe.com',
        'https://m.stripe.network',
        'https://js.stripe.com',
        'https://*.clerk.com',
        'https://*.clerk.services',
      ],
      frameSrc: [
        "'self'",
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        'https://hooks.stripe.com',
        'https://*.clerk.com',
        'https://*.clerk.services',
      ],
      mediaSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
// Extra security headers
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(self)');
  next();
});
app.use(hpp());
app.use(compression());

// Optional HTTPS enforcement (behind proxy/load balancer)
if (process.env.ENFORCE_HTTPS === 'true') {
  app.use((req, res, next) => {
    const proto = req.header('x-forwarded-proto');
    if (proto && proto !== 'https' && (req.method === 'GET' || req.method === 'HEAD')) {
      const canonicalBase = (process.env.CANONICAL_BASE_URL || process.env.APP_BASE_URL || '').trim().replace(/\/+$/, '');
      if (canonicalBase && canonicalBase.startsWith('https://')) {
        // Normalize the original URL to a safe, same-origin path
        let requestPath = req.originalUrl || '/';
        // Disallow protocol-relative (//host) and absolute (scheme:) forms
        if (requestPath.startsWith('//') || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(requestPath)) {
          requestPath = '/';
        }
        if (!requestPath.startsWith('/')) {
          requestPath = `/${requestPath}`;
        }
        const targetUrl = `${canonicalBase}${requestPath}`;
        return res.redirect(308, targetUrl);
      }
      // No canonical HTTPS base configured; avoid redirecting with user-controlled host
      return next();
    }
    return next();
  });
}

/** ---------- Stripe Webhook (raw body) ---------- */
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);

/** ---------- Demais middlewares ---------- */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(clerkMiddleware());
// Ensure every request has a request id
app.use((req, res, next) => {
  const reqId = req.header('x-request-id') || nanoid();
  res.setHeader('X-Request-Id', reqId);
  (req as any).requestId = reqId;
  next();
});
// Cache headers: no-store for authenticated responses
app.use((req, res, next) => {
  const isAuth = Boolean((req as any).authUserId);
  if (isAuth) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});
app.use((req, _res, next) => {
  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
  const anonymizedIp = ip ? ip.replace(/(\d+)$/, '0') : '';
  (req as any).log = logger.child({
    path: req.path,
    method: req.method,
    requestId: req.header('x-request-id'),
    ip: anonymizedIp,
    ua: req.header('user-agent')
  });
  next();
});

// Safe body redaction for logs/handlers: strip common PII fields
app.use((req, _res, next) => {
  const piiKeys = new Set([
    'password','currentPassword','newPassword','token','accessToken','refreshToken','idToken','secret','clientSecret','ssn','cpf','cnpj','creditCard','cardNumber','cvv'
  ]);
  const redact = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(redact);
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (piiKeys.has(k)) {
        out[k] = '[REDACTED]';
      } else if (k.toLowerCase().includes('email') && typeof v === 'string') {
        out[k] = maskEmail(v);
      } else if ((k.toLowerCase().includes('cpf') || k.toLowerCase().includes('cnpj')) && typeof v === 'string') {
        out[k] = maskCpfCnpj(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  };
  (req as any).safeBody = redact(req.body);
  next();
});

// Minimal request completion logging with duration
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    (req as any).log.info({ status: res.statusCode, durationMs: Math.round(durationMs), route: req.originalUrl }, 'request_completed');
  });
  next();
});

/** ---------- Servir arquivos estáticos ---------- */
app.use('/uploads', express.static('uploads'));

// Health check endpoint
const healthController = new HealthController();
app.get('/api/health', healthController.alive.bind(healthController));
app.get('/health', healthController.alive.bind(healthController));

/** ---------- Rotas ---------- */
app.use('/api', apiLimiter);
app.use('/api/projects', projectsRouter);
app.use('/api/projects', projectImagesRouter);
app.use('/api/projects', projectVideosRouter);
app.use('/api/contributions', contributionsRouter);
app.use('/api', subscriptionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api', commentsRouter);
app.use('/api', checkoutRouter);
app.use('/api', meRouter)
app.use('/api', connectRouter)
app.use('/api', eventsRouter)

/** ---------- Error Handler ---------- */
app.use(errorHandler);

export default app;
