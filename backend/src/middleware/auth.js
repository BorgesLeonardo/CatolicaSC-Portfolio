import { clerkClient } from '../config/clerk.js';
import prisma from '../config/database.js';

// Middleware para validar JWT do Clerk
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autorização não fornecido',
        code: 'MISSING_AUTH_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verifica o token com o Clerk
    const payload = await clerkClient.verifyToken(token);
    
    if (!payload || !payload.sub) {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    const clerkUserId = payload.sub;

    // Busca ou cria o usuário no banco de dados
    let user = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (!user) {
      // Se o usuário não existe no banco, busca no Clerk e cria
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      
      user = await prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
          imageUrl: clerkUser.imageUrl || null,
          role: 'USER' // Default role
        }
      });
    }

    // Adiciona o usuário ao request
    req.user = user;
    req.clerkUserId = clerkUserId;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'ClerkAPIError') {
      return res.status(401).json({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

// Middleware opcional para rotas que podem ou não ter autenticação
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.clerkUserId = null;
      return next();
    }

    const token = authHeader.substring(7);
    const payload = await clerkClient.verifyToken(token);
    
    if (payload && payload.sub) {
      const clerkUserId = payload.sub;
      const user = await prisma.user.findUnique({
        where: { clerkUserId }
      });
      
      req.user = user;
      req.clerkUserId = clerkUserId;
    } else {
      req.user = null;
      req.clerkUserId = null;
    }
    
    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    req.user = null;
    req.clerkUserId = null;
    next();
  }
}

// Middleware para verificar se o usuário é admin
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Usuário não autenticado',
      code: 'UNAUTHENTICATED'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Acesso negado. Apenas administradores podem acessar este recurso',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }

  next();
}
