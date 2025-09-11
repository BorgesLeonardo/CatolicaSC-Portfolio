import { getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';

export function requireApiAuth(req: Request, res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  // anexe o userId no req para facilitar
  (req as any).authUserId = userId;
  next();
}

