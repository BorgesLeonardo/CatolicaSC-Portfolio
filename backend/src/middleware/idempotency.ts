import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../infrastructure/prisma';

// Simple idempotency persistence table via Prisma
// You must add the Prisma model in schema.prisma

function hashBody(body: unknown): string {
  const json = JSON.stringify(body ?? {});
  return crypto.createHash('sha256').update(json).digest('hex');
}

export async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') return next();

  const key = req.header('Idempotency-Key');
  if (!key) return next();

  const requestHash = hashBody(req.body);
  const endpoint = req.baseUrl + req.path;

  try {
    const existing = await prisma.idempotencyKey.findUnique({ where: { key } });
    if (existing) {
      if (existing.requestHash !== requestHash || existing.endpoint !== endpoint) {
        return res.status(409).json({ error: 'IdempotencyConflict', message: 'Idempotency-Key já usado com payload diferente' });
      }
      if (existing.responseStatus && existing.responseBody) {
        res.status(existing.responseStatus);
        try {
          return res.json(JSON.parse(existing.responseBody));
        } catch {
          return res.send(existing.responseBody);
        }
      }
      // in-progress: allow to proceed
      return next();
    }

    await prisma.idempotencyKey.create({
      data: {
        key,
        endpoint,
        requestHash,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Hook into res.json / res.send to store response
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    (res as any).json = (body: any) => {
      const bodyStr = JSON.stringify(body);
      prisma.idempotencyKey.update({ where: { key }, data: { responseStatus: res.statusCode, responseBody: bodyStr } }).catch(() => {});
      return originalJson(body);
    };

    (res as any).send = (body: any) => {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      prisma.idempotencyKey.update({ where: { key }, data: { responseStatus: res.statusCode, responseBody: bodyStr } }).catch(() => {});
      return originalSend(body);
    };

    return next();
  } catch (err) {
    return next(err);
  }
}


