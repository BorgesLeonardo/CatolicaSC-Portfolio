import express from 'express';
import { Webhook } from 'svix';
import { clerkClient } from '../config/clerk.js';
import { syncUserFromClerk, removeUserFromDatabase, getUserByClerkId, updateUserProfile } from '../services/userService.js';
import { authenticateUser } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

// Webhook do Clerk para sincronizar usuários
router.post('/webhook', async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET não configurado');
      return res.status(500).json({ error: 'Webhook secret não configurado' });
    }

    // Headers necessários para validação
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Headers de webhook ausentes' });
    }

    // Cria o webhook handler
    const wh = new Webhook(WEBHOOK_SECRET);
    
    let evt;
    try {
      evt = wh.verify(req.body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Erro ao verificar webhook:', err);
      return res.status(400).json({ error: 'Assinatura inválida' });
    }

    const { type, data } = evt;
    console.log(`📨 Webhook recebido: ${type}`);

    // Processa diferentes tipos de eventos
    switch (type) {
      case 'user.created':
        await syncUserFromClerk(data.id);
        break;
        
      case 'user.updated':
        await syncUserFromClerk(data.id);
        break;
        
      case 'user.deleted':
        await removeUserFromDatabase(data.id);
        break;
        
      default:
        console.log(`Evento não tratado: ${type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter perfil do usuário autenticado
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await getUserByClerkId(req.clerkUserId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      campaigns: user.campaigns,
      contributions: user.contributions
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar perfil do usuário
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    
    const updatedUser = await updateUserProfile(req.clerkUserId, {
      name,
      imageUrl
    });

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      imageUrl: updatedUser.imageUrl,
      role: updatedUser.role,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para sincronizar usuário manualmente (útil para testes)
router.post('/sync', authenticateUser, async (req, res) => {
  try {
    const user = await syncUserFromClerk(req.clerkUserId);
    
    res.json({
      message: 'Usuário sincronizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro ao sincronizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar status da autenticação
router.get('/status', authenticateUser, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Rota para obter estatísticas do usuário
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [campaignsCount, contributionsCount, totalContributed] = await Promise.all([
      prisma.campaign.count({
        where: { creatorId: userId }
      }),
      prisma.contribution.count({
        where: { userId: userId }
      }),
      prisma.contribution.aggregate({
        where: { 
          userId: userId,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      })
    ]);

    res.json({
      campaigns: {
        created: campaignsCount
      },
      contributions: {
        made: contributionsCount,
        totalAmount: totalContributed._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
