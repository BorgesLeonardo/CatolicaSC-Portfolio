import { prisma } from '../infrastructure/prisma';
import { AppError } from '../utils/AppError';
import { slugify, appendNumericSuffix } from '../utils/slug';

export interface CreateProjectData {
  title: string;
  description: string;
  // Direct campaigns use goalCents
  goalCents?: number | undefined;
  fundingType: 'DIRECT' | 'RECURRING';
  deadline: string; // endsAt
  imageUrl?: string | undefined;
  categoryId: string;
  minContributionCents?: number | undefined;
  videoUrl?: string | undefined;
  // Subscription (recurrence) optional fields
  subscriptionEnabled?: boolean | undefined;
  subscriptionPriceCents?: number | undefined;
  subscriptionInterval?: 'MONTH' | 'YEAR' | undefined;
}

export interface UpdateProjectData {
  title?: string | undefined;
  description?: string | undefined;
  goalCents?: number | undefined;
  deadline?: string | undefined;
  imageUrl?: string | undefined;
  videoUrl?: string | undefined;
  categoryId?: string | undefined;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | undefined;
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

    const baseData: any = {
      ownerId,
      title: data.title,
      description: data.description,
      fundingType: data.fundingType,
      goalCents: typeof data.goalCents === 'number' ? data.goalCents : 0,
      deadline: new Date(data.deadline),
      minContributionCents: data.minContributionCents ?? null,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      categoryId: data.categoryId,
      slug,
      status: 'PUBLISHED',
      startsAt: new Date(),
      version: 1,
    };

    // Enforce consistency between funding type and subscription fields
    if (data.fundingType === 'RECURRING') {
      if (!data.subscriptionPriceCents || !data.subscriptionInterval) {
        throw new AppError('ValidationError', 422, { fieldErrors: { subscriptionPriceCents: ['Informe o preço da assinatura'], subscriptionInterval: ['Informe o intervalo da assinatura'] } });
      }
      baseData.subscriptionEnabled = true;
      baseData.subscriptionPriceCents = data.subscriptionPriceCents;
      baseData.subscriptionInterval = data.subscriptionInterval;
    } else {
      // DIRECT
      baseData.subscriptionEnabled = false;
      baseData.subscriptionPriceCents = null;
      baseData.subscriptionInterval = null;
      if (typeof data.goalCents !== 'number') {
        throw new AppError('ValidationError', 422, { fieldErrors: { goalCents: ['Informe a meta'] } });
      }
    }

    const project = await prisma.project.create({
      data: baseData,
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
      where.status = 'PUBLISHED';
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          owner: { select: { id: true, name: true } },
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
        owner: { select: { id: true, name: true } },
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
        owner: { select: { id: true, name: true } },
        category: true,
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return { items };
  }

  async update(id: string, data: UpdateProjectData, userId: string) {
    // noop: removed debug log
    
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

    // noop: removed debug log

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

    // noop: removed debug log
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
    // Fallback to a random suffix using crypto when available
    let suffix = '';
    try {
      const g: any = globalThis as any;
      if (g.crypto && typeof g.crypto.getRandomValues === 'function') {
        const arr = new Uint8Array(4);
        g.crypto.getRandomValues(arr);
        suffix = Array.from(arr).map((b: number) => b.toString(16).padStart(2, '0')).join('').slice(0, 8);
      }
    } catch {
      // ignore and fall back to time-based suffix below
    }
    if (!suffix) {
      suffix = Date.now().toString(36).slice(-8);
    }
    return `${base}-${suffix}`;
  }
}
