import { Router } from 'express';
import { authenticateUser, optionalAuth } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/auth/me
 * Retorna informações do usuário autenticado
 */
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = req.user!;
    
    res.json({
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * GET /api/auth/profile
 * Retorna perfil completo do usuário com estatísticas
 */
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = req.user!;
    
    // Buscar estatísticas do usuário
    const [campaignsCount, contributionsCount, totalRaised] = await Promise.all([
      prisma.campaign.count({
        where: { creatorId: user.id }
      }),
      prisma.contribution.count({
        where: { userId: user.id }
      }),
      prisma.contribution.aggregate({
        where: { 
          userId: user.id,
          status: 'paid'
        },
        _sum: {
          amount: true
        }
      })
    ]);

    res.json({
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        role: user.role
      },
      stats: {
        campaignsCreated: campaignsCount,
        contributionsMade: contributionsCount,
        totalContributed: totalRaised._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * PUT /api/auth/profile
 * Atualiza perfil do usuário
 */
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const user = req.user!;
    const { name, imageUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        imageUrl: imageUrl || user.imageUrl,
        updatedAt: new Date()
      }
    });

    res.json({
      user: {
        id: updatedUser.id,
        clerkUserId: updatedUser.clerkUserId,
        email: updatedUser.email,
        name: updatedUser.name,
        imageUrl: updatedUser.imageUrl,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * GET /api/auth/users
 * Lista usuários (apenas admin)
 */
router.get('/users', authenticateUser, async (req, res) => {
  try {
    const user = req.user!;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: 'Acesso negado. Apenas administradores podem acessar este recurso',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
    }

    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search ? {
      OR: [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          clerkUserId: true,
          email: true,
          name: true,
          imageUrl: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * GET /api/auth/check
 * Verifica se o usuário está autenticado (rota opcional)
 */
router.get('/check', optionalAuth, async (req, res) => {
  res.json({
    authenticated: !!req.user,
    user: req.user || null
  });
});

export default router;

