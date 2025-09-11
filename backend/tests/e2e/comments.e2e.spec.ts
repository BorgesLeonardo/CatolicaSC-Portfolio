import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../__mocks__/prisma';

// Mock auth e prisma
jest.mock('../../src/middleware/auth', () => require('../__mocks__/authClerk'));
jest.mock('../../src/infrastructure/prisma', () => require('../__mocks__/prisma'));

describe('Comments E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/projects/:id/comments', () => {
    it('deve criar comentário com sucesso', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Teste',
        ownerId: 'user_123',
      };

      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        userId: 'user_test_123',
        content: 'Ótimo projeto!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.comment.create.mockResolvedValue(mockComment);

      const commentData = {
        content: 'Ótimo projeto!',
      };

      const res = await request(app)
        .post('/api/projects/proj_1/comments')
        .send(commentData);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: 'comment_1',
        projectId: 'proj_1',
        content: 'Ótimo projeto!',
      });
      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projectId: 'proj_1',
            userId: 'user_test_123',
            content: 'Ótimo projeto!',
          })
        })
      );
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const invalidData = {
        content: '', // vazio
      };

      const res = await request(app)
        .post('/api/projects/proj_1/comments')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'ValidationError');
    });

    it('deve retornar erro 404 para projeto não encontrado', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      const commentData = {
        content: 'Comentário teste',
      };

      const res = await request(app)
        .post('/api/projects/proj_inexistente/comments')
        .send(commentData);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Project not found');
    });
  });

  describe('GET /api/projects/:id/comments', () => {
    it('deve listar comentários de um projeto', async () => {
      const mockComments = [
        {
          id: 'comment_1',
          projectId: 'proj_1',
          userId: 'user_123',
          content: 'Primeiro comentário',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'comment_2',
          projectId: 'proj_1',
          userId: 'user_456',
          content: 'Segundo comentário',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      prisma.comment.findMany.mockResolvedValue(mockComments);

      const res = await request(app)
        .get('/api/projects/proj_1/comments');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({
        id: 'comment_1',
        projectId: 'proj_1',
        content: 'Primeiro comentário',
      });
      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: 'proj_1' }
        })
      );
    });

    it('deve retornar erro 400 para projectId inválido', async () => {
      const res = await request(app)
        .get('/api/projects/123/comments'); // ID inválido (não é CUID)

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'ValidationError');
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    it('deve deletar comentário com sucesso', async () => {
      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        authorId: 'user_test_123',
        content: 'Comentário para deletar',
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'proj_1',
          ownerId: 'user_test_123',
        },
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.delete.mockResolvedValue(mockComment);

      const res = await request(app)
        .delete('/api/comments/comment_1');

      expect(res.status).toBe(204);
      expect(prisma.comment.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'comment_1' }
        })
      );
    });

    it('deve retornar erro 404 para comentário não encontrado', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/comments/comment_inexistente');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Comment not found');
    });

    it('deve retornar erro 403 para usuário não autorizado', async () => {
      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        authorId: 'user_diferente', // usuário diferente
        content: 'Comentário de outro usuário',
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'proj_1',
          ownerId: 'user_outro', // nem autor nem dono
        },
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);

      const res = await request(app)
        .delete('/api/comments/comment_1');

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Forbidden');
    });
  });
});
