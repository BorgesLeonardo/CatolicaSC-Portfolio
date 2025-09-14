import { CategoriesService } from '../../../services/categories.service';
import { prisma } from '../../../infrastructure/prisma';

// Mock do Prisma
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(() => {
    service = new CategoriesService();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return categories with project counts', async () => {
      const mockCategories = [
        {
          id: 'cat1',
          name: 'Technology',
          description: 'Tech projects',
          color: '#FF5733',
          icon: 'tech-icon',
          _count: {
            projects: 5
          }
        },
        {
          id: 'cat2',
          name: 'Art',
          description: 'Art projects',
          color: '#33FF57',
          icon: 'art-icon',
          _count: {
            projects: 3
          }
        }
      ];

      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);

      const result = await service.list();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          icon: true,
          _count: {
            select: {
              projects: {
                where: { deletedAt: null }
              }
            }
          }
        }
      });

      expect(result).toEqual([
        {
          id: 'cat1',
          name: 'Technology',
          description: 'Tech projects',
          color: '#FF5733',
          icon: 'tech-icon',
          projectsCount: 5,
          _count: {
            projects: 5
          }
        },
        {
          id: 'cat2',
          name: 'Art',
          description: 'Art projects',
          color: '#33FF57',
          icon: 'art-icon',
          projectsCount: 3,
          _count: {
            projects: 3
          }
        }
      ]);
    });

    it('should return empty array when no categories found', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      (prisma.category.findMany as jest.Mock).mockRejectedValue(error);

      await expect(service.list()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getById', () => {
    it('should return category with project count when found', async () => {
      const mockCategory = {
        id: 'cat1',
        name: 'Technology',
        description: 'Tech projects',
        color: '#FF5733',
        icon: 'tech-icon',
        _count: {
          projects: 5
        }
      };

      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.getById('cat1');

      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: 'cat1', isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          icon: true,
          _count: {
            select: {
              projects: {
                where: { deletedAt: null }
              }
            }
          }
        }
      });

      expect(result).toEqual({
        id: 'cat1',
        name: 'Technology',
        description: 'Tech projects',
        color: '#FF5733',
        icon: 'tech-icon',
        projectsCount: 5,
        _count: {
          projects: 5
        }
      });
    });

    it('should return null when category not found', async () => {
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      (prisma.category.findFirst as jest.Mock).mockRejectedValue(error);

      await expect(service.getById('cat1')).rejects.toThrow('Database connection failed');
    });
  });
});
