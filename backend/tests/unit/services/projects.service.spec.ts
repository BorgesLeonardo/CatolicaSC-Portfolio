import { ProjectsService } from '../../../src/services/projects.service';
import { prisma } from '../../__mocks__/prisma';
import { AppError } from '../../../src/utils/AppError';

// Mock do Prisma
jest.mock('../../../src/infrastructure/prisma', () => require('../../__mocks__/prisma'));

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    service = new ProjectsService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar projeto com sucesso', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'Test Description',
        goalCents: 100000,
        deadline: '2024-12-31T23:59:59.000Z',
        imageUrl: 'https://example.com/image.jpg',
      };

      const mockProject = {
        id: 'proj_1',
        ...projectData,
        ownerId: 'user_1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prisma.user.upsert.mockResolvedValue({ id: 'user_1' });
      prisma.project.create.mockResolvedValue(mockProject);

      const result = await service.create(projectData, 'user_1');

      expect(result).toEqual(mockProject);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        update: {},
        create: { id: 'user_1' },
      });
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          ownerId: 'user_1',
          title: projectData.title,
          description: projectData.description,
          goalCents: projectData.goalCents,
          deadline: new Date(projectData.deadline),
          imageUrl: projectData.imageUrl,
          categoryId: null,
        },
        include: {
          category: true
        }
      });
    });

    it('deve criar projeto sem campos opcionais', async () => {
      const projectData = {
        title: 'Test Project',
        goalCents: 100000,
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const mockProject = {
        id: 'proj_1',
        ...projectData,
        description: null,
        imageUrl: null,
        ownerId: 'user_1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prisma.user.upsert.mockResolvedValue({ id: 'user_1' });
      prisma.project.create.mockResolvedValue(mockProject);

      const result = await service.create(projectData, 'user_1');

      expect(result).toEqual(mockProject);
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          ownerId: 'user_1',
          title: projectData.title,
          description: null,
          goalCents: projectData.goalCents,
          deadline: new Date(projectData.deadline),
          imageUrl: null,
          categoryId: null,
        },
        include: {
          category: true
        }
      });
    });
  });

  describe('list', () => {
    it('deve listar projetos sem filtros', async () => {
      const mockProjects = [
        { id: 'proj_1', title: 'Project 1' },
        { id: 'proj_2', title: 'Project 2' },
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);
      prisma.project.count.mockResolvedValue(2);

      const result = await service.list();

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
        items: mockProjects,
      });
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          category: true
        }
      });
    });

    it('deve listar projetos com filtros de busca', async () => {
      const mockProjects = [{ id: 'proj_1', title: 'Test Project' }];

      prisma.project.findMany.mockResolvedValue(mockProjects);
      prisma.project.count.mockResolvedValue(1);

      const result = await service.list({
        q: 'test',
        ownerId: 'user_1',
        active: true,
        page: 2,
        pageSize: 5,
      });

      expect(result).toEqual({
        page: 2,
        pageSize: 5,
        total: 1,
        items: mockProjects,
      });
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          title: { contains: 'test', mode: 'insensitive' },
          ownerId: 'user_1',
          deadline: { gte: expect.any(Date) },
        },
        orderBy: { createdAt: 'desc' },
        skip: 5,
        take: 5,
      });
    });

    it('deve normalizar página e tamanho da página', async () => {
      prisma.project.findMany.mockResolvedValue([]);
      prisma.project.count.mockResolvedValue(0);

      await service.list({ page: -1, pageSize: 100 });

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0, // página -1 vira 1, então skip = 0
        take: 50, // pageSize 100 vira 50
      });
    });
  });

  describe('getById', () => {
    it('deve retornar projeto existente', async () => {
      const mockProject = {
        id: 'proj_1',
        title: 'Test Project',
        deletedAt: null,
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.getById('proj_1');

      expect(result).toEqual(mockProject);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj_1' },
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
        title: 'Test Project',
        deletedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.getById('proj_1')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });
  });

  describe('getByOwner', () => {
    it('deve retornar projetos do proprietário', async () => {
      const mockProjects = [
        { id: 'proj_1', title: 'Project 1', ownerId: 'user_1' },
        { id: 'proj_2', title: 'Project 2', ownerId: 'user_1' },
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.getByOwner('user_1');

      expect(result).toEqual({ items: mockProjects });
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user_1', deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar projeto com sucesso', async () => {
      const mockProject = {
        id: 'proj_1',
        ownerId: 'user_1',
        deletedAt: null,
      };

      const updateData = {
        title: 'Updated Project',
        goalCents: 150000,
        deadline: '2024-12-31T23:59:59.000Z',
      };

      const updatedProject = {
        ...mockProject,
        ...updateData,
        deadline: new Date(updateData.deadline),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.project.update.mockResolvedValue(updatedProject);

      const result = await service.update('proj_1', updateData, 'user_1');

      expect(result).toEqual(updatedProject);
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj_1' },
        data: {
          ...updateData,
          deadline: new Date(updateData.deadline),
        },
      });
    });

    it('deve lançar erro para projeto não encontrado', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.update('proj_inexistente', {}, 'user_1')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });

    it('deve lançar erro para projeto deletado', async () => {
      const mockProject = {
        id: 'proj_1',
        ownerId: 'user_1',
        deletedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.update('proj_1', {}, 'user_1')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });

    it('deve lançar erro para usuário não autorizado', async () => {
      const mockProject = {
        id: 'proj_1',
        ownerId: 'other_user',
        deletedAt: null,
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.update('proj_1', {}, 'user_1')).rejects.toThrow(
        new AppError('Forbidden', 403)
      );
    });
  });

  describe('delete', () => {
    it('deve deletar projeto com sucesso', async () => {
      const mockProject = {
        id: 'proj_1',
        ownerId: 'user_1',
        deletedAt: null,
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.project.update.mockResolvedValue({});

      await service.delete('proj_1', 'user_1');

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj_1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('deve lançar erro para projeto não encontrado', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.delete('proj_inexistente', 'user_1')).rejects.toThrow(
        new AppError('Project not found', 404)
      );
    });

    it('deve lançar erro para usuário não autorizado', async () => {
      const mockProject = {
        id: 'proj_1',
        ownerId: 'other_user',
        deletedAt: null,
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.delete('proj_1', 'user_1')).rejects.toThrow(
        new AppError('Forbidden', 403)
      );
    });
  });
});