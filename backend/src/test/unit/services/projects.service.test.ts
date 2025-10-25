import { ProjectsService, CreateProjectData, UpdateProjectData, ProjectFilters } from '../../../services/projects.service';
import { prisma } from '../../../infrastructure/prisma';
import { AppError } from '../../../utils/AppError';

// Mock do Prisma
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    service = new ProjectsService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validProjectData: CreateProjectData = {
      title: 'Test Project',
      description: 'This is a test project description',
      fundingType: 'DIRECT',
      goalCents: 100000,
      deadline: '2024-12-31T23:59:59Z',
      imageUrl: 'https://example.com/image.jpg',
      categoryId: 'cm12345678901234567890',
    };

    it('should create project successfully', async () => {
      const mockCategory = { id: 'cat1', name: 'Technology', isActive: true };
      const mockProject = { id: 'proj1', ...validProjectData, category: mockCategory };

      (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user123' });
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.project.create as jest.Mock).mockResolvedValue(mockProject);

      const result = await service.create(validProjectData, 'user123');

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user123' },
        update: {},
        create: { id: 'user123' }
      });
      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: validProjectData.categoryId, isActive: true }
      });
      expect(prisma.project.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          ownerId: 'user123',
          title: validProjectData.title,
          description: validProjectData.description,
          fundingType: 'DIRECT',
          goalCents: validProjectData.goalCents,
          deadline: new Date(validProjectData.deadline),
          minContributionCents: null,
          imageUrl: validProjectData.imageUrl,
          videoUrl: null,
          categoryId: validProjectData.categoryId,
          slug: expect.any(String),
          status: 'PUBLISHED',
          startsAt: expect.any(Date),
          version: 1,
          subscriptionEnabled: false,
          subscriptionPriceCents: null,
          subscriptionInterval: null,
        }),
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        }
      }));
      expect(result).toEqual(mockProject);
    });

    it('should create RECURRING project enforcing subscription fields', async () => {
      const mockCategory = { id: 'cat1', name: 'Technology', isActive: true };
      const recurringData: CreateProjectData = {
        title: 'Recurring Project',
        description: 'This is a test project description',
        fundingType: 'RECURRING',
        deadline: '2024-12-31T23:59:59Z',
        categoryId: 'cm12345678901234567890',
        subscriptionPriceCents: 2990,
        subscriptionInterval: 'MONTH',
      };

      (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user123' });
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.project.create as jest.Mock).mockResolvedValue({ id: 'p1' });

      await service.create(recurringData, 'user123');

      expect(prisma.project.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          fundingType: 'RECURRING',
          subscriptionEnabled: true,
          subscriptionPriceCents: 2990,
          subscriptionInterval: 'MONTH',
        })
      }));
    });

    it('should create project without imageUrl', async () => {
      const projectDataWithoutImage = { ...validProjectData };
      delete projectDataWithoutImage.imageUrl;

      const mockCategory = { id: 'cat1', name: 'Technology', isActive: true };
      const mockProject = { id: 'proj1', ...projectDataWithoutImage, category: mockCategory };

      (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user123' });
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.project.create as jest.Mock).mockResolvedValue(mockProject);

      const result = await service.create(projectDataWithoutImage, 'user123');

      expect(prisma.project.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          ownerId: 'user123',
          title: projectDataWithoutImage.title,
          description: projectDataWithoutImage.description,
          fundingType: 'DIRECT',
          goalCents: projectDataWithoutImage.goalCents,
          deadline: new Date(projectDataWithoutImage.deadline),
          minContributionCents: null,
          imageUrl: null,
          videoUrl: null,
          categoryId: projectDataWithoutImage.categoryId,
          slug: expect.any(String),
          status: 'PUBLISHED',
          startsAt: expect.any(Date),
          version: 1,
          subscriptionEnabled: false,
          subscriptionPriceCents: null,
          subscriptionInterval: null,
        }),
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        }
      }));
      expect(result).toEqual(mockProject);
    });

    it('should throw AppError when category not found', async () => {
      (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user123' });
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.create(validProjectData, 'user123'))
        .rejects.toThrow(new AppError('Category not found or inactive', 400));

      expect(prisma.project.create).not.toHaveBeenCalled();
    });

    it('should throw AppError when category is inactive', async () => {
      (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user123' });
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.create(validProjectData, 'user123'))
        .rejects.toThrow(new AppError('Category not found or inactive', 400));
    });
  });

  describe('list', () => {
    it('should list projects with default filters', async () => {
      const mockProjects = [
        { id: 'proj1', title: 'Project 1', category: { name: 'Tech' } },
        { id: 'proj2', title: 'Project 2', category: { name: 'Art' } }
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);
      (prisma.project.count as jest.Mock).mockResolvedValue(2);

      const result = await service.list();

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        }
      });
      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
        items: mockProjects
      });
    });

    it('should list projects with custom filters', async () => {
      const filters: ProjectFilters = {
        page: 2,
        pageSize: 5,
        q: 'test',
        ownerId: 'user123',
        categoryId: 'cat1',
        active: true
      };

      const mockProjects = [{ id: 'proj1', title: 'Test Project' }];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);
      (prisma.project.count as jest.Mock).mockResolvedValue(1);

      const result = await service.list(filters);

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          deletedAt: null,
          title: { contains: 'test', mode: 'insensitive' },
          ownerId: 'user123',
          categoryId: 'cat1',
          deadline: expect.objectContaining({ gte: expect.any(Date) }),
          status: 'PUBLISHED',
        }),
        orderBy: { createdAt: 'desc' },
        skip: 5, // (page - 1) * pageSize
        take: 5,
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        }
      });
      expect(result).toEqual({
        page: 2,
        pageSize: 5,
        total: 1,
        items: mockProjects
      });
    });

    it('should clamp page and pageSize values', async () => {
      const filters: ProjectFilters = {
        page: -1,
        pageSize: 100
      };

      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.project.count as jest.Mock).mockResolvedValue(0);

      await service.list(filters);

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0, // Clamped to 1, so (1-1)*10 = 0
        take: 50, // Clamped to 50
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        }
      });
    });
  });

  describe('getById', () => {
    it('should return project when found', async () => {
      const mockProject = {
        id: 'proj1',
        title: 'Test Project',
        deletedAt: null,
        category: { name: 'Tech' }
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await service.getById('proj1');

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj1' },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        }
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw AppError when project not found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getById('nonexistent'))
        .rejects.toThrow(new AppError('Project not found', 404));
    });

    it('should throw AppError when project is deleted', async () => {
      const deletedProject = {
        id: 'proj1',
        title: 'Test Project',
        deletedAt: new Date(),
        category: { name: 'Tech' }
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(deletedProject);

      await expect(service.getById('proj1'))
        .rejects.toThrow(new AppError('Project not found', 404));
    });
  });

  describe('getByOwner', () => {
    it('should return projects by owner', async () => {
      const mockProjects = [
        { id: 'proj1', title: 'Project 1', category: { name: 'Tech' } },
        { id: 'proj2', title: 'Project 2', category: { name: 'Art' } }
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await service.getByOwner('user123');

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user123', deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        }
      });
      expect(result).toEqual({ items: mockProjects });
    });
  });

  describe('update', () => {
    const updateData: UpdateProjectData = {
      title: 'Updated Title',
      description: 'Updated description'
    };

    it('should update project successfully', async () => {
      const mockProject = { id: 'proj1', ownerId: 'user123', ...updateData };
      const mockCategory = { id: 'cat1', isActive: true };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'proj1', ownerId: 'user123', deletedAt: null });
      (prisma.project.update as jest.Mock).mockResolvedValue(mockProject);

      const result = await service.update('proj1', updateData, 'user123');

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj1' },
        data: updateData,
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        }
      });
      expect(result).toEqual(mockProject);
    });

    it('should validate category when provided', async () => {
      const updateDataWithCategory = { ...updateData, categoryId: 'cat1' };
      const mockProject = { id: 'proj1', ownerId: 'user123', ...updateDataWithCategory };
      const mockCategory = { id: 'cat1', isActive: true };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'proj1', ownerId: 'user123', deletedAt: null });
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.project.update as jest.Mock).mockResolvedValue(mockProject);

      const result = await service.update('proj1', updateDataWithCategory, 'user123');

      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: 'cat1', isActive: true }
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw AppError when category not found', async () => {
      const updateDataWithCategory = { ...updateData, categoryId: 'cat1' };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'proj1', ownerId: 'user123', deletedAt: null });
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.update('proj1', updateDataWithCategory, 'user123'))
        .rejects.toThrow(new AppError('Category not found or inactive', 400));
    });

    it('should convert deadline string to Date', async () => {
      const updateDataWithDeadline = { ...updateData, deadline: '2024-12-31T23:59:59Z' };
      const mockProject = { id: 'proj1', ownerId: 'user123', ...updateDataWithDeadline };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'proj1', ownerId: 'user123', deletedAt: null });
      (prisma.project.update as jest.Mock).mockResolvedValue(mockProject);

      await service.update('proj1', updateDataWithDeadline, 'user123');

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj1' },
        data: {
          ...updateDataWithDeadline,
          deadline: new Date('2024-12-31T23:59:59Z')
        },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        }
      });
    });
  });

  describe('delete', () => {
    it('should soft delete project successfully', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'proj1', ownerId: 'user123', deletedAt: null });
      (prisma.project.update as jest.Mock).mockResolvedValue(undefined);

      await service.delete('proj1', 'user123');

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj1' },
        data: { deletedAt: expect.any(Date) }
      });
    });
  });

  describe('assertOwnerOrThrow', () => {
    it('should throw AppError when project not found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('nonexistent', {}, 'user123'))
        .rejects.toThrow(new AppError('Project not found', 404));
    });

    it('should throw AppError when project is deleted', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'proj1', ownerId: 'user123', deletedAt: new Date() });

      await expect(service.update('proj1', {}, 'user123'))
        .rejects.toThrow(new AppError('Project not found', 404));
    });

    it('should throw AppError when user is not owner', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'proj1', ownerId: 'other-user', deletedAt: null });

      await expect(service.update('proj1', {}, 'user123'))
        .rejects.toThrow(new AppError('Forbidden', 403));
    });
  });
});
