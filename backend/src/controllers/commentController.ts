import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export interface CreateCommentRequest {
  campaignId: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export const createComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId, content }: CreateCommentRequest = req.body;

    // Validate required fields
    if (!campaignId || !content) {
      throw createError('Campaign ID and content are required', 400);
    }

    // Validate content is not empty
    if (content.trim().length === 0) {
      throw createError('Content cannot be empty', 400);
    }

    // Check if campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw createError('Campaign not found', 404);
    }

    if (!campaign.isActive) {
      throw createError('Campaign is not active', 400);
    }

    // Get or create user from Clerk
    let user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        campaignId,
        userId: user.id,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        campaign: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.success(comment, 201);
  } catch (error) {
    next(error);
  }
};

export const getCommentsByCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw createError('Campaign not found', 404);
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { campaignId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.comment.count({
        where: { campaignId }
      })
    ]);

    res.success(comments, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content }: UpdateCommentRequest = req.body;

    // Validate content
    if (!content || content.trim().length === 0) {
      throw createError('Content is required and cannot be empty', 400);
    }

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingComment) {
      throw createError('Comment not found', 404);
    }

    // Check if user is the author
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user || existingComment.userId !== user.id) {
      throw createError('You can only update your own comments', 403);
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        campaign: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.success(updatedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingComment) {
      throw createError('Comment not found', 404);
    }

    // Check if user is the author
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user || existingComment.userId !== user.id) {
      throw createError('You can only delete your own comments', 403);
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id }
    });

    res.success({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
