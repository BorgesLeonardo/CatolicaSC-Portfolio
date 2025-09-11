import { prisma } from '../infrastructure/prisma';
import { AppError } from '../utils/AppError';

export interface CreateProjectData {
  title: string;
  description?: string | undefined;
  goalCents: number;
  deadline: string;
  imageUrl?: string | undefined;
}

export interface UpdateProjectData {
  title?: string | undefined;
  description?: string | undefined;
  goalCents?: number | undefined;
  deadline?: string | undefined;
  imageUrl?: string | undefined;
}

export interface ProjectFilters {
  q?: string | undefined;
  ownerId?: string | undefined;
  active?: boolean | undefined;
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

    const project = await prisma.project.create({
      data: {
        ownerId,
        title: data.title,
        description: data.description || null,
        goalCents: data.goalCents,
        deadline: new Date(data.deadline),
        imageUrl: data.imageUrl || null,
      },
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
    
    if (filters.active) {
      where.deadline = { gte: new Date() };
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    return { page, pageSize, total, items };
  }

  async getById(id: string) {
    const project = await prisma.project.findUnique({ 
      where: { id } 
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
    });

    return { items };
  }

  async update(id: string, data: UpdateProjectData, userId: string) {
    await this.assertOwnerOrThrow(id, userId);

    const updateData: any = { ...data };
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }

    const updated = await prisma.project.update({ 
      where: { id }, 
      data: updateData 
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
