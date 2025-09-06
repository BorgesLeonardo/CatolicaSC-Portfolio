import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/clerk-sdk-node';
import { createError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw createError('Authorization token is required', 401);
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
      issuer: (iss) => iss.startsWith('https://clerk.') || iss.includes('clerk'),
    });

    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid,
    };

    next();
  } catch (error) {
    next(createError('Invalid or expired token', 401));
  }
};
