import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Configuração da URL do banco com SSL para Supabase
const databaseUrl = process.env.DATABASE_URL;
const sslConfig =
  process.env.NODE_ENV === 'production'
    ? '?sslmode=require&sslcert=prod-ca-2021.crt'
    : '?sslmode=require';

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: databaseUrl + sslConfig,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
