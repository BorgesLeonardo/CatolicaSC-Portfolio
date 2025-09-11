jest.mock('../../../src/infrastructure/prisma', () => require('../../__mocks__/prisma'));

import { prisma } from '../../__mocks__/prisma';
import { ProjectsService } from '../../../src/services/projects.service';
import { AppError } from '../../../src/utils/AppError';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    service = new ProjectsService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar projeto com sucesso', async () => {
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

      prisma.user.upsert.mockResolvedValue({ id: 'user_123' });
      prisma.project.create.mockResolvedValue(mockProject);

      const projectData = {
        title: 'Projeto Teste',
        description: 'Descrição do projeto',
        goalCents: 100000,
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = await service.create(projectData, 'user_123');

      expect(result).toEqual(mockProject);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        update: {},
        create: { id: 'user_123' }
      });
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          ownerId: 'user_123',
          title: 'Projeto Teste',
          description: 'Descrição do projeto',
          goalCents: 100000,
          deadline: new Date('2024-12-31T23:59:59.000Z'),
          imageUrl: null,
        }
      });
    });

    it('deve criar projeto sem descrição e imageUrl', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Simples',
        description: null,
        goalCents: 50000,
        deadline: new Date('2024-12-31'),
        ownerId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.upsert.mockResolvedValue({ id: 'user_123' });
      prisma.project.create.mockResolvedValue(mockProject);

      const projectData = {
        title: 'Projeto Simples',
        goalCents: 50000,
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const result = await service.create(projectData, 'user_123');

      expect(result).toEqual(mockProject);
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          ownerId: 'user_123',
          title: 'Projeto Simples',
          description: null,
          goalCents: 50000,
          deadline: new Date('2024-12-31T23:59:59.000Z'),
          imageUrl: null,
        }
      });
    });
  });

  describe('list', () => {
    it('deve listar projetos com filtros padrão', async () => {
      const mockProjects = [
        {
          id: 'proj_1',
          title: 'Projeto 1',
          ownerId: 'user_123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);
      prisma.project.count.mockResolvedValue(1);

      const result = await service.list();

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 1,
        items: mockProjects
      });
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('deve aplicar filtros de busca', async () => {
      const mockProjects: any[] = [];
      prisma.project.findMany.mockResolvedValue(mockProjects);
      prisma.project.count.mockResolvedValue(0);

      const filters = {
        q: 'teste',
        ownerId: 'user_123',
        active: true,
        page: 2,
        pageSize: 5,
      };

      const result = await service.list(filters);

      expect(result).toEqual({
        page: 2,
        pageSize: 5,
        total: 0,
        items: []
      });
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          title: { contains: 'teste', mode: 'insensitive' },
          ownerId: 'user_123',
          deadline: { gte: expect.any(Date) }
        },
        orderBy: { createdAt: 'desc' },
        skip: 5,
        take: 5,
      });
    });

    it('deve limitar pageSize máximo em 50', async () => {
      prisma.project.findMany.mockResolvedValue([]);
      prisma.project.count.mockResolvedValue(0);

      const filters = { pageSize: 100 };
      await service.list(filters);

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50
        })
      );
    });

    it('deve garantir page mínimo de 1', async () => {
      prisma.project.findMany.mockResolvedValue([]);
      prisma.project.count.mockResolvedValue(0);

      const filters = { page: 0 };
      await service.list(filters);

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0
        })
      );
    });
  });

  describe('getById', () => {
    it('deve retornar projeto existente', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Teste',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.getById('proj_1');

      expect(result).toEqual(mockProject);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj_1' }
      });
    });

    it('deve lançar erro para projeto não encontrado', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.getById('proj_inexistente')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });

    it('deve lançar erro para projeto deletado', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Projeto Deletado',
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.getById('proj_1')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });
  });

  describe('getByOwner', () => {
    it('deve retornar projetos do dono', async () => {
      const mockProjects = [
        {
          id: 'proj_1',
          title: 'Projeto 1',
          ownerId: 'user_123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.getByOwner('user_123');

      expect(result).toEqual({ items: mockProjects });
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user_123', deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar projeto com sucesso', async () => {
      const mockUpdatedProject = {
        id: 'proj_1',
        title: 'Projeto Atualizado',
        goalCents: 150000,
        ownerId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue({ ownerId: 'user_123', deletedAt: null });
      prisma.project.update.mockResolvedValue(mockUpdatedProject);

      const updateData = {
        title: 'Projeto Atualizado',
        goalCents: 150000,
      };

      const result = await service.update('proj_1', updateData, 'user_123');

      expect(result).toEqual(mockUpdatedProject);
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj_1' },
        data: updateData
      });
    });

    it('deve converter deadline string para Date', async () => {
      const mockUpdatedProject = {
        id: 'proj_1',
        deadline: new Date('2024-12-31'),
        ownerId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue({ ownerId: 'user_123', deletedAt: null });
      prisma.project.update.mockResolvedValue(mockUpdatedProject);

      const updateData = {
        deadline: '2024-12-31T23:59:59.000Z',
      };

      await service.update('proj_1', updateData, 'user_123');

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj_1' },
        data: {
          deadline: new Date('2024-12-31T23:59:59.000Z')
        }
      });
    });

    it('deve lançar erro para projeto não encontrado', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.update('proj_inexistente', {}, 'user_123')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });

    it('deve lançar erro para usuário não autorizado', async () => {
      prisma.project.findUnique.mockResolvedValue({ ownerId: 'user_diferente', deletedAt: null });

      await expect(service.update('proj_1', {}, 'user_123')).rejects.toThrow(
        new AppError('Forbidden', 403)
      );
    });
  });

  describe('delete', () => {
    it('deve deletar projeto com sucesso (soft delete)', async () => {
      prisma.project.findUnique.mockResolvedValue({ ownerId: 'user_123', deletedAt: null });
      prisma.project.update.mockResolvedValue({});

      await service.delete('proj_1', 'user_123');

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj_1' },
        data: { deletedAt: expect.any(Date) }
      });
    });

    it('deve lançar erro para projeto não encontrado', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.delete('proj_inexistente', 'user_123')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });

    it('deve lançar erro para usuário não autorizado', async () => {
      prisma.project.findUnique.mockResolvedValue({ ownerId: 'user_diferente', deletedAt: null });

      await expect(service.delete('proj_1', 'user_123')).rejects.toThrow(
        new AppError('Forbidden', 403)
      );
    });
  });
});
