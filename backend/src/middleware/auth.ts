import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        clerkUserId: string;
        email: string;
        name?: string;
        imageUrl?: string;
        role: 'user' | 'admin';
      };
    }
  }
}

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Middleware para autenticação com Clerk
 * Valida o token JWT e adiciona informações do usuário ao request
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Token de autorização não fornecido',
          code: 'MISSING_TOKEN'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verificar token com Clerk
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    if (!payload) {
      return res.status(401).json({
        error: {
          message: 'Token inválido',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // Buscar ou criar usuário no banco de dados
    const clerkUserId = payload.sub;
    const email = payload.email;
    const name = payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim();
    const imageUrl = payload.picture;

    let user = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    // Se usuário não existe, criar automaticamente
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId,
          email: email || '',
          name: name || null,
          imageUrl: imageUrl || null,
          role: 'user'
        }
      });
    } else {
      // Atualizar informações do usuário se necessário
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: email || user.email,
          name: name || user.name,
          imageUrl: imageUrl || user.imageUrl,
          updatedAt: new Date()
        }
      });
    }

    // Adicionar usuário ao request
    req.user = {
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name || undefined,
      imageUrl: user.imageUrl || undefined,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    return res.status(401).json({
      error: {
        message: 'Falha na autenticação',
        code: 'AUTH_FAILED',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }
    });
  }
};

/**
 * Middleware opcional para verificar se o usuário é admin
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      }
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: {
        message: 'Acesso negado. Apenas administradores podem acessar este recurso',
        code: 'INSUFFICIENT_PERMISSIONS'
      }
    });
  }

  next();
};

/**
 * Middleware opcional para rotas que podem ser acessadas com ou sem autenticação
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Sem token, continuar sem usuário
      return next();
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    if (payload) {
      const clerkUserId = payload.sub;
      const user = await prisma.user.findUnique({
        where: { clerkUserId }
      });

      if (user) {
        req.user = {
          id: user.id,
          clerkUserId: user.clerkUserId,
          email: user.email,
          name: user.name || undefined,
          imageUrl: user.imageUrl || undefined,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, continuar sem usuário
    next();
  }
};

