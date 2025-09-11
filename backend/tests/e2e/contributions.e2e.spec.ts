import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../__mocks__/prisma';

// Mock auth, prisma e stripe
jest.mock('../../src/middleware/auth', () => require('../__mocks__/authClerk'));
jest.mock('../../src/infrastructure/prisma', () => require('../__mocks__/prisma'));
jest.mock('../../src/lib/stripe', () => require('../__mocks__/stripe'));

describe('Contributions E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/contributions/checkout', () => {
    it('deve criar checkout session com sucesso', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Teste',
        goalCents: 100000,
        ownerId: 'user_123',
      };

      const mockContribution = {
        id: 'contrib_1',
        projectId: 'proj_1',
        userId: 'user_test_123',
        amountCents: 5000,
        status: 'PENDING',
        createdAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.contribution.create.mockResolvedValue(mockContribution);

      const contributionData = {
        projectId: 'proj_1',
        amountCents: 5000,
      };

      const res = await request(app)
        .post('/api/contributions/checkout')
        .send(contributionData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('checkoutUrl');
      expect(res.body.checkoutUrl).toBe('https://stripe.test/session/cs_test_123');
      expect(prisma.contribution.create).toHaveBeenCalled();
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const invalidData = {
        projectId: 'invalid-id',
        amountCents: -100, // negativo
      };

      const res = await request(app)
        .post('/api/contributions/checkout')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'ValidationError');
    });

    it('deve retornar erro 404 para projeto não encontrado', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      const contributionData = {
        projectId: 'proj_inexistente',
        amountCents: 5000,
      };

      const res = await request(app)
        .post('/api/contributions/checkout')
        .send(contributionData);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Project not found');
    });
  });

  describe('GET /api/contributions/project/:projectId', () => {
    it('deve listar contribuições de um projeto', async () => {
      const mockContributions = [
        {
          id: 'contrib_1',
          projectId: 'proj_1',
          userId: 'user_123',
          amountCents: 5000,
          status: 'SUCCEEDED',
          createdAt: new Date(),
        },
        {
          id: 'contrib_2',
          projectId: 'proj_1',
          userId: 'user_456',
          amountCents: 10000,
          status: 'SUCCEEDED',
          createdAt: new Date(),
        }
      ];

      prisma.contribution.findMany.mockResolvedValue(mockContributions);

      const res = await request(app)
        .get('/api/contributions/project/proj_1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({
        id: 'contrib_1',
        projectId: 'proj_1',
        amountCents: 5000,
        status: 'SUCCEEDED',
      });
      expect(prisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: 'proj_1' }
        })
      );
    });

    it('deve retornar erro 400 para projectId inválido', async () => {
      const res = await request(app)
        .get('/api/contributions/project/123'); // ID inválido (não é CUID)

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'ValidationError');
    });
  });
});
