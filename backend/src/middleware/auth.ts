import { getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// Interface para dados de autenticação
interface AuthData {
  userId: string;
  role?: string;
}

// Função para extrair dados de auth do header de teste
function getTestAuth(req: Request): AuthData | null {
  if (process.env.NODE_ENV === 'test' && process.env.TEST_BYPASS_AUTH === 'true') {
    // Se o header x-test-auth-bypass for 'false', não fazer bypass
    if (req.header('x-test-auth-bypass') === 'false') {
      return null;
    }
    const userId = req.header('x-test-user-id') || 'user_test_id';
    const role = req.header('x-test-user-role') || 'user';
    return { userId, role };
  }
  return null;
}

export function requireApiAuth(req: Request, res: Response, next: NextFunction): void {
  // Bypass para testes
  const testAuth = getTestAuth(req);
  if (testAuth) {
    (req as any).authUserId = testAuth.userId;
    (req as any).authRole = testAuth.role;
    return next();
  }

  // Fluxo normal com Clerk
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  (req as any).authUserId = userId;
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Bypass para testes
  const testAuth = getTestAuth(req);
  if (testAuth) {
    (req as any).authUserId = testAuth.userId;
    (req as any).authRole = testAuth.role;
    return next();
  }

  // Fluxo normal com Clerk
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  (req as any).authUserId = userId;
  next();
}

