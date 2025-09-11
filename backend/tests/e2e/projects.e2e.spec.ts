import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../__mocks__/prisma';

// Mock auth e prisma
jest.mock('../../src/middleware/auth', () => require('../__mocks__/authClerk'));
jest.mock('../../src/infrastructure/prisma', () => require('../__mocks__/prisma'));

describe('Projects E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('deve listar projetos com sucesso', async () => {
      const mockProjects = [
        {
          id: 'proj_1',
          title: 'Projeto Teste',
          description: 'Descrição do projeto',
          goalCents: 100000,
          deadline: new Date('2024-12-31'),
          ownerId: 'user_123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      const res = await request(app)
        .get('/api/projects')
        .query({ page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: 'proj_1',
        title: 'Projeto Teste',
      });
      expect(prisma.project.findMany).toHaveBeenCalled();
    });

    it('deve aplicar filtros de busca', async () => {
      prisma.project.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/projects')
        .query({ q: 'teste', active: 'true' });

      expect(res.status).toBe(200);
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: expect.objectContaining({
              contains: 'teste',
              mode: 'insensitive'
            })
          })
        })
      );
    });
  });

  describe('POST /api/projects', () => {
    it('deve criar projeto com usuário autenticado', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Novo Projeto',
        description: 'Descrição do novo projeto',
        goalCents: 50000,
        deadline: new Date('2024-12-31'),
        ownerId: 'user_test_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.create.mockResolvedValue(mockProject);

      const projectData = {
        title: 'Novo Projeto',
        description: 'Descrição do novo projeto',
        goalCents: 50000,
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const res = await request(app)
        .post('/api/projects')
        .send(projectData);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: 'proj_1',
        title: 'Novo Projeto',
        goalCents: 50000,
      });
      expect(prisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Novo Projeto',
            goalCents: 50000,
            ownerId: 'user_test_123',
          })
        })
      );
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const invalidData = {
        title: 'A', // muito curto
        goalCents: -100, // negativo
      };

      const res = await request(app)
        .post('/api/projects')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'ValidationError');
    });
  });

  describe('GET /api/projects/:id', () => {
    it('deve retornar projeto por ID', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Teste',
        description: 'Descrição do projeto',
        goalCents: 100000,
        deadline: new Date('2024-12-31'),
        ownerId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const res = await request(app)
        .get('/api/projects/proj_1');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: 'proj_1',
        title: 'Projeto Teste',
      });
      expect(prisma.project.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'proj_1' }
        })
      );
    });

    it('deve retornar erro 400 para ID inválido', async () => {
      const res = await request(app)
        .get('/api/projects/123'); // ID inválido (não é CUID)

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'ValidationError');
    });
  });

  describe('GET /api/projects/mine', () => {
    it('deve retornar projetos do usuário autenticado', async () => {
      const mockProjects = [
        {
          id: 'proj_1',
          title: 'Meu Projeto',
          ownerId: 'user_test_123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      const res = await request(app)
        .get('/api/projects/mine');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]).toMatchObject({
        id: 'proj_1',
        title: 'Meu Projeto',
      });
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ownerId: 'user_test_123' }
        })
      );
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('deve atualizar projeto com sucesso', async () => {
      const mockUpdatedProject = {
        id: 'proj_1',
        title: 'Projeto Atualizado',
        description: 'Nova descrição',
        goalCents: 150000,
        deadline: new Date('2024-12-31'),
        ownerId: 'user_test_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue({ ownerId: 'user_test_123' });
      prisma.project.update.mockResolvedValue(mockUpdatedProject);

      const updateData = {
        title: 'Projeto Atualizado',
        goalCents: 150000,
      };

      const res = await request(app)
        .patch('/api/projects/proj_1')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: 'proj_1',
        title: 'Projeto Atualizado',
        goalCents: 150000,
      });
    });

    it('deve retornar erro 400 para dados de atualização inválidos', async () => {
      const invalidData = {
        title: 'A', // muito curto
        goalCents: -100, // negativo
      };

      const res = await request(app)
        .patch('/api/projects/proj_1')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'ValidationError');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('deve deletar projeto com sucesso', async () => {
      prisma.project.findUnique.mockResolvedValue({ ownerId: 'user_test_123' });
      prisma.project.update.mockResolvedValue({});

      const res = await request(app)
        .delete('/api/projects/proj_1');

      expect(res.status).toBe(204);
      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'proj_1' },
          data: { deletedAt: expect.any(Date) }
        })
      );
    });
  });
});
