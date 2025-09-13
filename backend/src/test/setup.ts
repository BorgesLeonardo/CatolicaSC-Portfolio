import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '../infrastructure/prisma';

// Configuração global para testes
beforeAll(async () => {
  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = 'test';
  process.env.TEST_BYPASS_AUTH = 'true';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
});

afterAll(async () => {
  // Limpar conexões
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Limpar dados de teste antes de cada teste
  try {
    await prisma.contribution.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.project.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    // Ignorar erros de limpeza
    console.warn('Warning: Could not clean database:', error);
  }
});

afterEach(async () => {
  // Limpar dados após cada teste
  try {
    await prisma.contribution.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.project.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    // Ignorar erros de limpeza
    console.warn('Warning: Could not clean database:', error);
  }
});
