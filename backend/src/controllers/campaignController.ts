import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export interface CreateCampaignRequest {
  title: string;
  description: string;
  goal: number;
  deadline: string;
  imageUrl?: string;
  categoryId?: string;
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  goal?: number;
  deadline?: string;
  imageUrl?: string;
  categoryId?: string;
}

export const createCampaign = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, goal, deadline, imageUrl, categoryId }: CreateCampaignRequest = req.body;

    // Validate required fields
    if (!title || !description || !goal || !deadline) {
      throw createError('Title, description, goal, and deadline are required', 400);
    }

    // Validate goal is positive
    if (goal <= 0) {
      throw createError('Goal must be a positive number', 400);
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      throw createError('Deadline must be in the future', 400);
    }

    // Get or create user from Clerk
    let user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        goal,
        deadline: deadlineDate,
        imageUrl,
        categoryId,
        authorId: user.id
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    });

    res.success(campaign, 201);
  } catch (error) {
    next(error);
  }
};

export const getCampaigns = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where: { isActive: true },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true
            }
          },
          _count: {
            select: {
              supports: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.campaign.count({
        where: { isActive: true }
      })
    ]);

    res.success(campaigns, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        },
        supports: {
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
          take: 10
        },
        comments: {
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
          take: 10
        },
        _count: {
          select: {
            supports: true,
            comments: true
          }
        }
      }
    });

    if (!campaign) {
      throw createError('Campaign not found', 404);
    }

    res.success(campaign);
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateCampaignRequest = req.body;

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingCampaign) {
      throw createError('Campaign not found', 404);
    }

    // Check if user is the author
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user || existingCampaign.authorId !== user.id) {
      throw createError('You can only update your own campaigns', 403);
    }

    // Validate goal if provided
    if (updateData.goal !== undefined && updateData.goal <= 0) {
      throw createError('Goal must be a positive number', 400);
    }

    // Validate deadline if provided
    if (updateData.deadline) {
      const deadlineDate = new Date(updateData.deadline);
      if (deadlineDate <= new Date()) {
        throw createError('Deadline must be in the future', 400);
      }
      updateData.deadline = deadlineDate.toISOString();
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.deadline && { deadline: new Date(updateData.deadline) })
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    });

    res.success(updatedCampaign);
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingCampaign) {
      throw createError('Campaign not found', 404);
    }

    // Check if user is the author
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user || existingCampaign.authorId !== user.id) {
      throw createError('You can only delete your own campaigns', 403);
    }

    // Delete campaign (cascade will handle related records)
    await prisma.campaign.delete({
      where: { id }
    });

    res.success({ message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
};
