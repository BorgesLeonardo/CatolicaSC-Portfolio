import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';
import { WebhookEvent } from '@clerk/backend';

const prisma = new PrismaClient();

// Interface para eventos do Clerk
interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    created_at: number;
    updated_at: number;
  };
}

/**
 * Processa webhooks do Clerk para sincronização de usuários
 */
export const handleClerkWebhook = async (req: Request, res: Response) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET não configurado');
      return res.status(500).json({ error: 'Webhook secret não configurado' });
    }

    // Verificar assinatura do webhook
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Headers do webhook inválidos' });
    }

    const payload = JSON.stringify(req.body);
    const webhook = new Webhook(WEBHOOK_SECRET);

    let event: ClerkWebhookEvent;

    try {
      event = webhook.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error('Erro na verificação do webhook:', err);
      return res.status(400).json({ error: 'Assinatura do webhook inválida' });
    }

    console.log(`📨 Webhook recebido: ${event.type}`);

    // Processar evento baseado no tipo
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data);
        break;
      
      case 'user.updated':
        await handleUserUpdated(event.data);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(event.data.id);
        break;
      
      default:
        console.log(`⚠️  Tipo de evento não tratado: ${event.type}`);
    }

    // Registrar evento no banco
    await prisma.webhookEvent.create({
      data: {
        provider: 'clerk',
        eventId: event.data.id,
        type: event.type,
        payload: event as any,
        processedAt: new Date(),
        signatureVerified: true
      }
    });

    res.status(200).json({ message: 'Webhook processado com sucesso' });

  } catch (error) {
    console.error('Erro no processamento do webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Processa criação de usuário
 */
async function handleUserCreated(userData: ClerkWebhookEvent['data']) {
  try {
    const email = userData.email_addresses[0]?.email_address || '';
    const name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || null;
    
    const user = await prisma.user.create({
      data: {
        clerkUserId: userData.id,
        email,
        name,
        imageUrl: userData.image_url || null,
        role: 'user'
      }
    });

    console.log(`✅ Usuário criado: ${user.email} (${user.id})`);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

/**
 * Processa atualização de usuário
 */
async function handleUserUpdated(userData: ClerkWebhookEvent['data']) {
  try {
    const email = userData.email_addresses[0]?.email_address || '';
    const name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || null;
    
    const user = await prisma.user.update({
      where: { clerkUserId: userData.id },
      data: {
        email,
        name,
        imageUrl: userData.image_url || null,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Usuário atualizado: ${user.email} (${user.id})`);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

/**
 * Processa exclusão de usuário
 */
async function handleUserDeleted(clerkUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (user) {
      // Soft delete - marcar como inativo ou remover dados sensíveis
      await prisma.user.update({
        where: { clerkUserId },
        data: {
          email: `deleted_${Date.now()}@deleted.com`,
          name: 'Usuário Removido',
          imageUrl: null,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Usuário removido: ${clerkUserId}`);
    }
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    throw error;
  }
}

/**
 * Endpoint para testar webhook (apenas desenvolvimento)
 */
export const testWebhook = async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Endpoint não disponível em produção' });
  }

  const testEvent: ClerkWebhookEvent = {
    type: 'user.created',
    data: {
      id: 'test_user_' + Date.now(),
      email_addresses: [{
        email_address: 'test@example.com',
        id: 'email_' + Date.now()
      }],
      first_name: 'Test',
      last_name: 'User',
      image_url: 'https://example.com/avatar.jpg',
      created_at: Date.now(),
      updated_at: Date.now()
    }
  };

  try {
    await handleUserCreated(testEvent.data);
    res.json({ message: 'Teste de webhook executado com sucesso', event: testEvent });
  } catch (error) {
    res.status(500).json({ error: 'Erro no teste de webhook', details: error });
  }
};

