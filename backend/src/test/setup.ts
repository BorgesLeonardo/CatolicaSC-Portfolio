import { jest } from '@jest/globals';

// Mock do Prisma
jest.mock('../infrastructure/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    contribution: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock do Stripe
jest.mock('../lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

// Mock do StripeClient
jest.mock('../utils/stripeClient', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

// Mock do Clerk
jest.mock('@clerk/express', () => ({
  clerkMiddleware: jest.fn(() => (req: any, res: any, next: any) => next()),
  getAuth: jest.fn(),
}));

// Não mockar serviços aqui; os testes unitários dos serviços precisam da implementação real.

// Configuração global para testes
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock do console para evitar logs durante os testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};