import { prisma } from '../infrastructure/prisma';

export class CategoriesService {
  async list() {
    const categories = await prisma.category.findMany({
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

    return categories.map((category: any) => ({
      ...category,
      projectsCount: category._count.projects
    }));
  }

  async getById(id: string) {
    const category = await prisma.category.findFirst({
      where: { id, isActive: true },
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

    if (!category) {
      return null;
    }

    return {
      ...category,
      projectsCount: category._count.projects
    };
  }
}
