import { getAuth, clerkClient } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { prisma } from '../infrastructure/prisma';

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

async function syncUserProfile(userId: string): Promise<void> {
  try {
    const u = await clerkClient.users.getUser(userId);
    const fullName = (u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ')).trim();
    const name = fullName || undefined;
    const email = (u.emailAddresses && u.emailAddresses[0]?.emailAddress) || undefined;

    await prisma.user.upsert({
      where: { id: userId },
      update: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      },
      create: { id: userId, name: name ?? null, email: email ?? null },
    });
  } catch {
    // Best-effort sync; ignore failures
  }
}

export async function requireApiAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Bypass para testes
  const testAuth = getTestAuth(req);
  if (testAuth) {
    (req as any).authUserId = testAuth.userId;
    (req as any).authRole = testAuth.role;
    return next();
  }

  // Fluxo normal com Clerk
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    (req as any).authUserId = userId;
    await syncUserProfile(userId);
    next();
  } catch (error) {
    throw new AppError('Unauthorized', 401);
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Bypass para testes
  const testAuth = getTestAuth(req);
  if (testAuth) {
    (req as any).authUserId = testAuth.userId;
    (req as any).authRole = testAuth.role;
    return next();
  }

  // Fluxo normal com Clerk
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    (req as any).authUserId = userId;
    await syncUserProfile(userId);
    next();
  } catch (error) {
    throw new AppError('Unauthorized', 401);
  }
}

