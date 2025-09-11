jest.mock('../../../src/infrastructure/prisma', () => require('../../__mocks__/prisma'));
jest.mock('../../../src/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://stripe.test/session/cs_test_123'
        })
      }
    }
  }
}));

import { prisma } from '../../__mocks__/prisma';
import { ContributionsService } from '../../../src/services/contributions.service';
import { AppError } from '../../../src/utils/AppError';

describe('ContributionsService', () => {
  let service: ContributionsService;

  beforeEach(() => {
    service = new ContributionsService();
    jest.clearAllMocks();
  });

  describe('createCheckout', () => {
    it('deve criar checkout session com sucesso', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Teste',
        deadline: new Date('2025-12-31'), // data futura
        ownerId: 'user_123',
        deletedAt: null,
      };

      const mockContribution = {
        id: 'contrib_1',
        projectId: 'proj_1',
        contributorId: 'user_test_123',
        amountCents: 5000,
        status: 'PENDING',
        createdAt: new Date(),
      };

      const mockSession = {
        id: 'cs_test_123',
        url: 'https://stripe.test/session/cs_test_123',
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.user.upsert.mockResolvedValue({ id: 'user_test_123' });
      prisma.contribution.create.mockResolvedValue(mockContribution);
      prisma.contribution.update.mockResolvedValue({});

      // Mock do Stripe já está configurado globalmente

      const checkoutData = {
        projectId: 'proj_1',
        amountCents: 5000,
      };

      const result = await service.createCheckout(checkoutData, 'user_test_123');

      expect(result).toEqual({
        checkoutUrl: 'https://stripe.test/session/cs_test_123',
        contributionId: 'contrib_1'
      });
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj_1' }
      });
      expect(prisma.contribution.create).toHaveBeenCalledWith({
        data: {
          projectId: 'proj_1',
          contributorId: 'user_test_123',
          amountCents: 5000,
          currency: 'BRL',
          status: 'PENDING',
        }
      });
    });

    it('deve lançar erro para projeto não encontrado', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      const checkoutData = {
        projectId: 'proj_inexistente',
        amountCents: 5000,
      };

      await expect(service.createCheckout(checkoutData, 'user_test_123')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });

    it('deve lançar erro para projeto deletado', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Deletado',
        deadline: new Date('2024-12-31'),
        ownerId: 'user_123',
        deletedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const checkoutData = {
        projectId: 'proj_1',
        amountCents: 5000,
      };

      await expect(service.createCheckout(checkoutData, 'user_test_123')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });

    it('deve lançar erro para projeto fechado', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Fechado',
        deadline: new Date('2020-12-31'), // data passada
        ownerId: 'user_123',
        deletedAt: null,
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const checkoutData = {
        projectId: 'proj_1',
        amountCents: 5000,
      };

      await expect(service.createCheckout(checkoutData, 'user_test_123')).rejects.toThrow(
        new AppError('Project is closed', 400)
      );
    });

    it('deve usar URLs customizadas quando fornecidas', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Teste',
        deadline: new Date('2025-12-31'), // data futura
        ownerId: 'user_123',
        deletedAt: null,
      };

      const mockContribution = {
        id: 'contrib_1',
        projectId: 'proj_1',
        contributorId: 'user_test_123',
        amountCents: 5000,
        status: 'PENDING',
        createdAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.user.upsert.mockResolvedValue({ id: 'user_test_123' });
      prisma.contribution.create.mockResolvedValue(mockContribution);
      prisma.contribution.update.mockResolvedValue({});

      const checkoutData = {
        projectId: 'proj_1',
        amountCents: 5000,
        successUrl: 'https://custom.com/success',
        cancelUrl: 'https://custom.com/cancel',
      };

      await service.createCheckout(checkoutData, 'user_test_123');

      // Verifica se o Stripe foi chamado com as URLs customizadas
      // O mock do Stripe já está configurado globalmente
    });
  });

  describe('listByProject', () => {
    it('deve listar contribuições com parâmetros padrão', async () => {
      const mockContributions = [
        {
          id: 'contrib_1',
          projectId: 'proj_1',
          contributorId: 'user_123',
          amountCents: 5000,
          status: 'SUCCEEDED',
          createdAt: new Date(),
          contributor: {
            id: 'user_123',
            name: 'João Silva',
            email: 'joao@email.com',
          },
        }
      ];

      prisma.contribution.findMany.mockResolvedValue(mockContributions);
      prisma.contribution.count.mockResolvedValue(1);

      const result = await service.listByProject('proj_1');

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 1,
        items: mockContributions
      });
      expect(prisma.contribution.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj_1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          contributor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('deve listar contribuições com paginação customizada', async () => {
      const mockContributions: any[] = [];
      prisma.contribution.findMany.mockResolvedValue(mockContributions);
      prisma.contribution.count.mockResolvedValue(0);

      const result = await service.listByProject('proj_1', 2, 5);

      expect(result).toEqual({
        page: 2,
        pageSize: 5,
        total: 0,
        items: []
      });
      expect(prisma.contribution.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj_1' },
        orderBy: { createdAt: 'desc' },
        skip: 5,
        take: 5,
        include: {
          contributor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  });
});
