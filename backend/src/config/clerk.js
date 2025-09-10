import { createClerkClient } from '@clerk/backend';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config({ path: '.envlocal' });

// Valida se as variáveis de ambiente estão configuradas
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY não encontrada nas variáveis de ambiente');
}

// Cria o cliente Clerk
export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Configurações do Clerk
export const clerkConfig = {
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
};

// Função para verificar se o Clerk está configurado
export function isClerkConfigured() {
  return !!(clerkConfig.secretKey && clerkConfig.publishableKey);
}

// Função para obter informações do usuário do Clerk
export async function getClerkUser(clerkUserId) {
  try {
    const user = await clerkClient.users.getUser(clerkUserId);
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário no Clerk:', error);
    return null;
  }
}

// Função para verificar se um usuário existe no Clerk
export async function verifyClerkUser(clerkUserId) {
  try {
    await clerkClient.users.getUser(clerkUserId);
    return true;
  } catch (error) {
    return false;
  }
}
