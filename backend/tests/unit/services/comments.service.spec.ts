import { CommentsService } from '../../../src/services/comments.service';
import { prisma } from '../../__mocks__/prisma';
import { AppError } from '../../../src/utils/AppError';

// Mock do Prisma
jest.mock('../../../src/infrastructure/prisma', () => require('../../__mocks__/prisma'));

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(() => {
    service = new CommentsService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar comentário com sucesso', async () => {
      const project = {
        id: 'proj_1',
        title: 'Test Project',
        ownerId: 'owner_1',
        deletedAt: null,
      };

      const commentData = {
        content: 'Ótimo projeto!',
      };

      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        authorId: 'user_1',
        content: 'Ótimo projeto!',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: 'user_1',
          name: 'User One',
          email: 'user1@example.com',
        },
      };

      prisma.project.findUnique.mockResolvedValue(project);
      prisma.user.upsert.mockResolvedValue({ id: 'user_1' });
      prisma.comment.create.mockResolvedValue(mockComment);

      const result = await service.create('proj_1', commentData, 'user_1');

      expect(result).toEqual(mockComment);

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj_1' },
      });

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        update: {},
        create: { id: 'user_1' },
      });

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          projectId: 'proj_1',
          authorId: 'user_1',
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
        content: 'Ótimo projeto!',
      };

      await expect(service.create('proj_inexistente', commentData, 'user_1')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });

    it('deve lançar erro para projeto deletado', async () => {
      const project = {
        id: 'proj_1',
        title: 'Test Project',
        ownerId: 'owner_1',
        deletedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(project);

      const commentData = {
        content: 'Ótimo projeto!',
      };

      await expect(service.create('proj_1', commentData, 'user_1')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });
  });

  describe('listByProject', () => {
    it('deve listar comentários de um projeto', async () => {
      const mockComments = [
        {
          id: 'comment_1',
          projectId: 'proj_1',
          authorId: 'user_1',
          content: 'Primeiro comentário',
          createdAt: new Date(),
          author: {
            id: 'user_1',
            name: 'User One',
            email: 'user1@example.com',
          },
        },
        {
          id: 'comment_2',
          projectId: 'proj_1',
          authorId: 'user_2',
          content: 'Segundo comentário',
          createdAt: new Date(),
          author: {
            id: 'user_2',
            name: 'User Two',
            email: 'user2@example.com',
          },
        },
      ];

      prisma.comment.findMany.mockResolvedValue(mockComments);
      prisma.comment.count.mockResolvedValue(2);

      const result = await service.listByProject('proj_1', 1, 10);

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
        items: mockComments,
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

    it('deve usar valores padrão para paginação', async () => {
      prisma.comment.findMany.mockResolvedValue([]);
      prisma.comment.count.mockResolvedValue(0);

      await service.listByProject('proj_1');

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

    it('deve calcular paginação corretamente', async () => {
      prisma.comment.findMany.mockResolvedValue([]);
      prisma.comment.count.mockResolvedValue(0);

      await service.listByProject('proj_1', 3, 5);

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj_1' },
        orderBy: { createdAt: 'desc' },
        skip: 10, // (3 - 1) * 5
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
    it('deve deletar comentário como autor', async () => {
      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        authorId: 'user_1',
        content: 'Comentário para deletar',
        project: {
          id: 'proj_1',
          ownerId: 'owner_1',
        },
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.delete.mockResolvedValue({});

      await service.delete('comment_1', 'user_1');

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'comment_1' },
        include: { project: true },
      });

      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment_1' },
      });
    });

    it('deve deletar comentário como dono do projeto', async () => {
      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        authorId: 'other_user',
        content: 'Comentário de outro usuário',
        project: {
          id: 'proj_1',
          ownerId: 'user_1', // user_1 é o dono do projeto
        },
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.delete.mockResolvedValue({});

      await service.delete('comment_1', 'user_1');

      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment_1' },
      });
    });

    it('deve lançar erro para comentário não encontrado', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.delete('comment_inexistente', 'user_1')).rejects.toThrow(
        new AppError('Comment not found', 404)
      );
    });

    it('deve lançar erro para usuário não autorizado', async () => {
      const mockComment = {
        id: 'comment_1',
        projectId: 'proj_1',
        authorId: 'other_user',
        content: 'Comentário de outro usuário',
        project: {
          id: 'proj_1',
          ownerId: 'another_owner', // nem autor nem dono
        },
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);

      await expect(service.delete('comment_1', 'user_1')).rejects.toThrow(
        new AppError('Forbidden', 403)
      );
    });
  });
});