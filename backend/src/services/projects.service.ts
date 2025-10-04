import { prisma } from '../infrastructure/prisma';
import { AppError } from '../utils/AppError';
import { slugify, appendNumericSuffix } from '../utils/slug';

export interface CreateProjectData {
  title: string;
  description: string;
  goalCents: number;
  deadline: string; // endsAt
  imageUrl?: string | undefined;
  categoryId: string;
  minContributionCents?: number | undefined;
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

    // Generate unique slug based on title
    const baseSlug = slugify(data.title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const project = await prisma.project.create({
      data: {
        ownerId,
        title: data.title,
        description: data.description,
        goalCents: data.goalCents,
        deadline: new Date(data.deadline),
        minContributionCents: data.minContributionCents ?? null,
        imageUrl: data.imageUrl || null,
        categoryId: data.categoryId,
        slug,
        status: 'PUBLISHED',
        startsAt: new Date(),
        version: 1,
      },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' }
        }
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
          category: true,
          images: {
            orderBy: { order: 'asc' }
          }
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
        category: true,
        images: {
          orderBy: { order: 'asc' }
        }
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
        category: true,
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return { items };
  }

  async update(id: string, data: UpdateProjectData, userId: string) {
    console.log('🔄 Updating project:', { id, data, userId });
    
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

    console.log('📝 Update data prepared:', updateData);

    const updated = await prisma.project.update({ 
      where: { id }, 
      data: updateData,
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    console.log('✅ Project updated successfully:', updated.id);
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

  private async ensureUniqueSlug(base: string): Promise<string> {
    let attempt = 1;
    let slugCandidate = base;
    // Loop with a reasonable cap
    while (attempt <= 20) {
      const existing = await prisma.project.findUnique({ where: { slug: slugCandidate } });
      if (!existing) return slugCandidate;
      attempt += 1;
      slugCandidate = appendNumericSuffix(base, attempt);
    }
    // Fallback to a cuid suffix
    return `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
