import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .envlocal
dotenv.config({ path: '.envlocal' });

// Cria uma instância do Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Função para testar a conexão com o banco
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com Supabase PostgreSQL estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return false;
  }
}

// Função para fechar a conexão
export async function disconnect() {
  await prisma.$disconnect();
}

export default prisma;
