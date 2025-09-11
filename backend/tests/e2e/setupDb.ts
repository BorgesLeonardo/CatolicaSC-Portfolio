import { PrismaClient } from '@prisma/client';
import { prisma } from '../../__mocks__/prisma';

// Configuração do banco de dados para testes E2E
export const setupTestDatabase = () => {
  beforeAll(async () => {
    // Conectar ao banco (mock)
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Resetar dados mockados para estado limpo
    resetMockData();
  });

  afterAll(async () => {
    // Desconectar do banco (mock)
    await prisma.$disconnect();
  });
};

// Função para resetar dados mockados
function resetMockData() {
  // Resetar todos os métodos do Prisma
  Object.values(prisma).forEach((model: any) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method: any) => {
        if (jest.isMockFunction(method)) {
          method.mockReset();
        }
      });
    }
  });
}

// Função para configurar dados de teste básicos
export const setupTestData = () => {
  // Configurar dados padrão que serão usados em todos os testes
  const testUser = {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const testProject = {
    id: 'test-project-1',
    title: 'Test Project',
    description: 'Test Description',
    goalCents: 100000,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias no futuro
    ownerId: 'test-user-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const testContribution = {
    id: 'test-contribution-1',
    amountCents: 5000,
    projectId: 'test-project-1',
    contributorId: 'test-user-1',
    status: 'completed' as const,
    stripeSessionId: 'cs_test_123',
    stripePaymentIntentId: 'pi_test_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const testComment = {
    id: 'test-comment-1',
    content: 'Test comment',
    projectId: 'test-project-1',
    authorId: 'test-user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    testUser,
    testProject,
    testContribution,
    testComment,
  };
};
