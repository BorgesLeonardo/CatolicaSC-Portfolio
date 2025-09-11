import { prisma } from '../infrastructure/prisma';
import { AppError } from '../utils/AppError';

export interface CreateProjectData {
  title: string;
  description: string;
  goalCents: number;
  deadline: string;
  imageUrl?: string | undefined;
  categoryId: string;
}

export interface UpdateProjectData {
  title?: string | undefined;
  description?: string | undefined;
  goalCents?: number | undefined;
  deadline?: string | undefined;
  imageUrl?: string | undefined;
  categoryId?: string | undefined;
}

export interface ProjectFilters {
  q?: string | undefined;
  ownerId?: string | undefined;
  active?: boolean | undefined;
  categoryId?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export class ProjectsService {
  async create(data: CreateProjectData, ownerId: string) {
    // Garante que o usuário existe
    await prisma.user.upsert({ 
      where: { id: ownerId }, 
      update: {}, 
      create: { id: ownerId } 
    });

    // Valida categoria (agora obrigatória)
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, isActive: true }
    });
    if (!category) {
      throw new AppError('Category not found or inactive', 400);
    }

    const project = await prisma.project.create({
      data: {
        ownerId,
        title: data.title,
        description: data.description,
        goalCents: data.goalCents,
        deadline: new Date(data.deadline),
        imageUrl: data.imageUrl || null,
        categoryId: data.categoryId,
      },
      include: {
        category: true
      }
    });

    return project;
  }

  async list(filters: ProjectFilters = {}) {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 10, 1), 50);

    const where: any = { deletedAt: null };
    
    if (filters.q) {
      where.title = { contains: filters.q, mode: 'insensitive' };
    }
    
    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }
    
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    
    if (filters.active) {
      where.deadline = { gte: new Date() };
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: true
        }
      }),
      prisma.project.count({ where }),
    ]);

    return { page, pageSize, total, items };
  }

  async getById(id: string) {
    const project = await prisma.project.findUnique({ 
      where: { id },
      include: {
        category: true
      }
    });
    
    if (!project || project.deletedAt) {
      throw new AppError('Project not found', 404);
    }

    return project;
  }

  async getByOwner(ownerId: string) {
    const items = await prisma.project.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true
      }
    });

    return { items };
  }

  async update(id: string, data: UpdateProjectData, userId: string) {
    await this.assertOwnerOrThrow(id, userId);

    // Valida categoria se fornecida
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, isActive: true }
      });
      if (!category) {
        throw new AppError('Category not found or inactive', 400);
      }
    }

    const updateData: any = { ...data };
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }

    const updated = await prisma.project.update({ 
      where: { id }, 
      data: updateData,
      include: {
        category: true
      }
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    await this.assertOwnerOrThrow(id, userId);

    await prisma.project.update({ 
      where: { id }, 
      data: { deletedAt: new Date() } 
    });
  }

  private async assertOwnerOrThrow(projectId: string, userId: string) {
    const found = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, deletedAt: true },
    });

    if (!found || found.deletedAt) {
      throw new AppError('Project not found', 404);
    }

    if (found.ownerId !== userId) {
      throw new AppError('Forbidden', 403);
    }
  }
}
