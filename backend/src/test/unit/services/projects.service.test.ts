import { ProjectsService, CreateProjectData, UpdateProjectData, ProjectFilters } from '../../services/projects.service';
import { prisma } from '../../infrastructure/prisma';
import { AppError } from '../../utils/AppError';

// Mock do Prisma
jest.mock('../../infrastructure/prisma', () => ({
  prisma: {
    user: {
      upsert: jest.fn()
    },
    category: {
      findFirst: jest.fn()
    },
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn()
    }
  }
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    service = new ProjectsService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockCreateData: CreateProjectData = {
      title: 'Test Project',
      description: 'A test project description',
      goalCents: 10000,
      deadline: '2024-12-31T23:59:59Z',
      imageUrl: 'https://example.com/image.jpg',
      categoryId: 'cat1'
    };

    it('should create project successfully', async () => {
      const mockCategory = { id: 'cat1', isActive: true };
      const mockProject = {
        id: 'proj1',
        ...mockCreateData,
        ownerId: 'user1',
        deadline: new Date(mockCreateData.deadline),
        category: mockCategory
      };

      mockPrisma.user.upsert.mockResolvedValue({ id: 'user1' } as any);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory as any);
      mockPrisma.project.create.mockResolvedValue(mockProject as any);

      const result = await service.create(mockCreateData, 'user1');

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user1' },
        update: {},
        create: { id: 'user1' }
      });

      expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: 'cat1', isActive: true }
      });

      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          ownerId: 'user1',
          title: mockCreateData.title,
          description: mockCreateData.description,
          goalCents: mockCreateData.goalCents,
          deadline: new Date(mockCreateData.deadline),
          imageUrl: mockCreateData.imageUrl,
          categoryId: mockCreateData.categoryId
        },
        include: {
          category: true
        }
      });

      expect(result).toEqual(mockProject);
    });

    it('should throw error when category not found', async () => {
      mockPrisma.user.upsert.mockResolvedValue({ id: 'user1' } as any);
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(service.create(mockCreateData, 'user1'))
        .rejects
        .toThrow(AppError);

      await expect(service.create(mockCreateData, 'user1'))
        .rejects
        .toThrow('Category not found or inactive');
    });

    it('should handle optional imageUrl', async () => {
      const dataWithoutImage = { ...mockCreateData };
      delete dataWithoutImage.imageUrl;

      const mockCategory = { id: 'cat1', isActive: true };
      const mockProject = {
        id: 'proj1',
        ...dataWithoutImage,
        ownerId: 'user1',
        deadline: new Date(dataWithoutImage.deadline),
        imageUrl: null,
        category: mockCategory
      };

      mockPrisma.user.upsert.mockResolvedValue({ id: 'user1' } as any);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory as any);
      mockPrisma.project.create.mockResolvedValue(mockProject as any);

      const result = await service.create(dataWithoutImage, 'user1');

      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          ownerId: 'user1',
          title: dataWithoutImage.title,
          description: dataWithoutImage.description,
          goalCents: dataWithoutImage.goalCents,
          deadline: new Date(dataWithoutImage.deadline),
          imageUrl: null,
          categoryId: dataWithoutImage.categoryId
        },
        include: {
          category: true
        }
      });

      expect(result).toEqual(mockProject);
    });
  });

  describe('list', () => {
    it('should list projects with default filters', async () => {
      const mockProjects = [
        { id: 'proj1', title: 'Project 1', category: { id: 'cat1', name: 'Tech' } },
        { id: 'proj2', title: 'Project 2', category: { id: 'cat2', name: 'Art' } }
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects as any);
      mockPrisma.project.count.mockResolvedValue(2);

      const result = await service.list();

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          category: true
        }
      });

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
        items: mockProjects
      });
    });

    it('should apply search filter', async () => {
      const filters: ProjectFilters = { q: 'test' };
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      await service.list(filters);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { 
          deletedAt: null,
          title: { contains: 'test', mode: 'insensitive' }
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          category: true
        }
      });
    });

    it('should apply owner filter', async () => {
      const filters: ProjectFilters = { ownerId: 'user1' };
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      await service.list(filters);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { 
          deletedAt: null,
          ownerId: 'user1'
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          category: true
        }
      });
    });

    it('should apply category filter', async () => {
      const filters: ProjectFilters = { categoryId: 'cat1' };
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      await service.list(filters);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { 
          deletedAt: null,
          categoryId: 'cat1'
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          category: true
        }
      });
    });

    it('should apply active filter', async () => {
      const filters: ProjectFilters = { active: true };
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      await service.list(filters);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { 
          deletedAt: null,
          deadline: { gte: expect.any(Date) }
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          category: true
        }
      });
    });

    it('should handle pagination', async () => {
      const filters: ProjectFilters = { page: 2, pageSize: 5 };
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      await service.list(filters);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 5, // (page - 1) * pageSize
        take: 5,
        include: {
          category: true
        }
      });
    });

    it('should enforce page size limits', async () => {
      const filters: ProjectFilters = { pageSize: 100 }; // > 50
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      await service.list(filters);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50, // Should be limited to 50
        include: {
          category: true
        }
      });
    });
  });

  describe('getById', () => {
    it('should return project by id', async () => {
      const mockProject = {
        id: 'proj1',
        title: 'Test Project',
        category: { id: 'cat1', name: 'Tech' }
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);

      const result = await service.getById('proj1');

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj1' },
        include: {
          category: true
        }
      });

      expect(result).toEqual(mockProject);
    });

    it('should throw error when project not found', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.getById('nonexistent'))
        .rejects
        .toThrow(AppError);

      await expect(service.getById('nonexistent'))
        .rejects
        .toThrow('Project not found');
    });

    it('should throw error when project is deleted', async () => {
      const deletedProject = {
        id: 'proj1',
        deletedAt: new Date()
      };

      mockPrisma.project.findUnique.mockResolvedValue(deletedProject as any);

      await expect(service.getById('proj1'))
        .rejects
        .toThrow(AppError);

      await expect(service.getById('proj1'))
        .rejects
        .toThrow('Project not found');
    });
  });

  describe('getByOwner', () => {
    it('should return projects by owner', async () => {
      const mockProjects = [
        { id: 'proj1', title: 'Project 1', category: { id: 'cat1', name: 'Tech' } },
        { id: 'proj2', title: 'Project 2', category: { id: 'cat2', name: 'Art' } }
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects as any);

      const result = await service.getByOwner('user1');

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user1', deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          category: true
        }
      });

      expect(result).toEqual({ items: mockProjects });
    });
  });

  describe('update', () => {
    it('should update project successfully', async () => {
      const mockProject = { id: 'proj1', ownerId: 'user1' };
      const updateData: UpdateProjectData = { title: 'Updated Title' };
      const updatedProject = { ...mockProject, ...updateData, category: { id: 'cat1' } };

      // Mock assertOwnerOrThrow by mocking the private method indirectly
      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);
      mockPrisma.project.update.mockResolvedValue(updatedProject as any);

      const result = await service.update('proj1', updateData, 'user1');

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj1' },
        data: updateData,
        include: {
          category: true
        }
      });

      expect(result).toEqual(updatedProject);
    });

    it('should validate category when provided', async () => {
      const mockProject = { id: 'proj1', ownerId: 'user1' };
      const updateData: UpdateProjectData = { categoryId: 'cat1' };
      const mockCategory = { id: 'cat1', isActive: true };
      const updatedProject = { ...mockProject, ...updateData, category: mockCategory };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory as any);
      mockPrisma.project.update.mockResolvedValue(updatedProject as any);

      await service.update('proj1', updateData, 'user1');

      expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: 'cat1', isActive: true }
      });
    });

    it('should throw error when category not found during update', async () => {
      const mockProject = { id: 'proj1', ownerId: 'user1' };
      const updateData: UpdateProjectData = { categoryId: 'nonexistent' };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(service.update('proj1', updateData, 'user1'))
        .rejects
        .toThrow(AppError);

      await expect(service.update('proj1', updateData, 'user1'))
        .rejects
        .toThrow('Category not found or inactive');
    });

    it('should convert deadline string to Date', async () => {
      const mockProject = { id: 'proj1', ownerId: 'user1' };
      const updateData: UpdateProjectData = { 
        deadline: '2024-12-31T23:59:59Z' 
      };
      const updatedProject = { ...mockProject, ...updateData, category: { id: 'cat1' } };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);
      mockPrisma.project.update.mockResolvedValue(updatedProject as any);

      await service.update('proj1', updateData, 'user1');

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj1' },
        data: {
          deadline: new Date('2024-12-31T23:59:59Z')
        },
        include: {
          category: true
        }
      });
    });
  });

  describe('delete', () => {
    it('should soft delete project', async () => {
      const mockProject = { id: 'proj1', ownerId: 'user1' };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);
      mockPrisma.project.update.mockResolvedValue({} as any);

      await service.delete('proj1', 'user1');

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj1' },
        data: { deletedAt: expect.any(Date) }
      });
    });
  });

  describe('assertOwnerOrThrow', () => {
    it('should throw error when project not found', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {}, 'user1'))
        .rejects
        .toThrow(AppError);

      await expect(service.update('nonexistent', {}, 'user1'))
        .rejects
        .toThrow('Project not found');
    });

    it('should throw error when project is deleted', async () => {
      const deletedProject = { id: 'proj1', ownerId: 'user1', deletedAt: new Date() };

      mockPrisma.project.findUnique.mockResolvedValue(deletedProject as any);

      await expect(service.update('proj1', {}, 'user1'))
        .rejects
        .toThrow(AppError);

      await expect(service.update('proj1', {}, 'user1'))
        .rejects
        .toThrow('Project not found');
    });

    it('should throw error when user is not owner', async () => {
      const mockProject = { id: 'proj1', ownerId: 'other-user' };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any);

      await expect(service.update('proj1', {}, 'user1'))
        .rejects
        .toThrow(AppError);

      await expect(service.update('proj1', {}, 'user1'))
        .rejects
        .toThrow('Forbidden');
    });
  });
});
