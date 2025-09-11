import { getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function requireApiAuth(req: Request, res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  // anexe o userId no req para facilitar
  (req as any).authUserId = userId;
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  (req as any).authUserId = userId;
  next();
}

