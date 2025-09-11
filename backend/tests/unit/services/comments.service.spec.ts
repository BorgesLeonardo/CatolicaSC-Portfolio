jest.mock('../../../src/infrastructure/prisma', () => require('../../__mocks__/prisma'));

import { prisma } from '../../__mocks__/prisma';
import { CommentsService } from '../../../src/services/comments.service';
import { AppError } from '../../../src/utils/AppError';

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(() => {
    service = new CommentsService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar comentário com sucesso', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Teste',
        deletedAt: null,
      };

      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        authorId: 'user_test_123',
        content: 'Ótimo projeto!',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: 'user_test_123',
          name: 'João Silva',
          email: 'joao@email.com',
        },
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.user.upsert.mockResolvedValue({ id: 'user_test_123' });
      prisma.comment.create.mockResolvedValue(mockComment);

      const commentData = {
        content: 'Ótimo projeto!',
      };

      const result = await service.create('proj_1', commentData, 'user_test_123');

      expect(result).toEqual(mockComment);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj_1' }
      });
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          projectId: 'proj_1',
          authorId: 'user_test_123',
          content: 'Ótimo projeto!',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('deve lançar erro para projeto não encontrado', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      const commentData = {
        content: 'Comentário teste',
      };

      await expect(service.create('proj_inexistente', commentData, 'user_test_123')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });

    it('deve lançar erro para projeto deletado', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Deletado',
        deletedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const commentData = {
        content: 'Comentário teste',
      };

      await expect(service.create('proj_1', commentData, 'user_test_123')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });
  });

  describe('listByProject', () => {
    it('deve listar comentários com parâmetros padrão', async () => {
      const mockComments = [
        {
          id: 'comment_1',
          projectId: 'proj_1',
          authorId: 'user_123',
          content: 'Primeiro comentário',
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: 'user_123',
            name: 'João Silva',
            email: 'joao@email.com',
          },
        }
      ];

      prisma.comment.findMany.mockResolvedValue(mockComments);
      prisma.comment.count.mockResolvedValue(1);

      const result = await service.listByProject('proj_1');

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 1,
        items: mockComments
      });
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj_1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('deve listar comentários com paginação customizada', async () => {
      const mockComments: any[] = [];
      prisma.comment.findMany.mockResolvedValue(mockComments);
      prisma.comment.count.mockResolvedValue(0);

      const result = await service.listByProject('proj_1', 2, 5);

      expect(result).toEqual({
        page: 2,
        pageSize: 5,
        total: 0,
        items: []
      });
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj_1' },
        orderBy: { createdAt: 'desc' },
        skip: 5,
        take: 5,
        include: {
          author: {
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

  describe('delete', () => {
    it('deve deletar comentário do próprio autor', async () => {
      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        authorId: 'user_test_123',
        content: 'Comentário para deletar',
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'proj_1',
          ownerId: 'user_diferente',
        },
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.delete.mockResolvedValue(mockComment);

      await service.delete('comment_1', 'user_test_123');

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'comment_1' },
        include: { project: true }
      });
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment_1' }
      });
    });

    it('deve deletar comentário sendo dono do projeto', async () => {
      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        authorId: 'user_diferente',
        content: 'Comentário de outro usuário',
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'proj_1',
          ownerId: 'user_test_123', // dono do projeto
        },
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.delete.mockResolvedValue(mockComment);

      await service.delete('comment_1', 'user_test_123');

      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment_1' }
      });
    });

    it('deve lançar erro para comentário não encontrado', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.delete('comment_inexistente', 'user_test_123')).rejects.toThrow(
        new AppError('Comment not found', 404)
      );
    });

    it('deve lançar erro para usuário não autorizado', async () => {
      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        authorId: 'user_diferente',
        content: 'Comentário de outro usuário',
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'proj_1',
          ownerId: 'user_outro', // nem autor nem dono
        },
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);

      await expect(service.delete('comment_1', 'user_test_123')).rejects.toThrow(
        new AppError('Forbidden', 403)
      );
    });
  });
});
