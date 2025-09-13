import { CategoriesService } from '../../services/categories.service';
import { prisma } from '../../infrastructure/prisma';

// Mock do Prisma
jest.mock('../../infrastructure/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn()
    }
  }
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(() => {
    service = new CategoriesService();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return active categories with project counts', async () => {
      const mockCategories = [
        {
          id: 'cat1',
          name: 'Technology',
          description: 'Tech projects',
          color: '#FF0000',
          icon: 'tech-icon',
          _count: {
            projects: 5
          }
        },
        {
          id: 'cat2',
          name: 'Art',
          description: 'Art projects',
          color: '#00FF00',
          icon: 'art-icon',
          _count: {
            projects: 3
          }
        }
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories as any);

      const result = await service.list();

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
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
          color: '#FF0000',
          icon: 'tech-icon',
          projectsCount: 5
        },
        {
          id: 'cat2',
          name: 'Art',
          description: 'Art projects',
          color: '#00FF00',
          icon: 'art-icon',
          projectsCount: 3
        }
      ]);
    });

    it('should return empty array when no categories found', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return category by id with project count', async () => {
      const mockCategory = {
        id: 'cat1',
        name: 'Technology',
        description: 'Tech projects',
        color: '#FF0000',
        icon: 'tech-icon',
        _count: {
          projects: 5
        }
      };

      mockPrisma.category.findFirst.mockResolvedValue(mockCategory as any);

      const result = await service.getById('cat1');

      expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
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
        color: '#FF0000',
        icon: 'tech-icon',
        projectsCount: 5
      });
    });

    it('should return null when category not found', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      const result = await service.getById('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when category is inactive', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      const result = await service.getById('inactive-cat');

      expect(result).toBeNull();
    });
  });
});
