import { prisma } from '../infrastructure/prisma';
import { AppError } from '../utils/AppError';
import { clerkClient } from '@clerk/express';

export interface CreateCommentData {
  content: string;
}

export class CommentsService {
  async create(projectId: string, data: CreateCommentData, authorId: string) {
    const project = await prisma.project.findUnique({ 
      where: { id: projectId } 
    });
    
    if (!project || project.deletedAt) {
      throw new AppError('Project not found', 404);
    }

    // Garante que o usuário existe e sincroniza nome/email do Clerk
    let name: string | undefined;
    let email: string | undefined;
    try {
      const u = await clerkClient.users.getUser(authorId);
      const fullName = (u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ')).trim();
      name = fullName || undefined;
      email = (u.emailAddresses && u.emailAddresses[0]?.emailAddress) || undefined;
    } catch {
      // Ignora falhas ao consultar Clerk; segue apenas com o ID
    }

    await prisma.user.upsert({ 
      where: { id: authorId }, 
      update: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      }, 
      create: { id: authorId, name: name ?? null, email: email ?? null } 
    });

    const comment = await prisma.comment.create({
      data: {
        projectId,
        authorId,
        content: data.content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return comment;
  }

  async listByProject(projectId: string, page: number = 1, pageSize: number = 10) {
    const where = { projectId };
    
    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return { page, pageSize, total, items };
  }

  async delete(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { project: true },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const isAuthor = comment.authorId === userId;
    const isProjectOwner = comment.project.ownerId === userId;

    if (!isAuthor && !isProjectOwner) {
      throw new AppError('Forbidden', 403);
    }

    await prisma.comment.delete({ where: { id: commentId } });
  }
}
