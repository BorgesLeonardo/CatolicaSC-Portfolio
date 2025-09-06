import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export interface CreateSupportRequest {
  campaignId: string;
  amount: number;
  message?: string;
  isAnonymous?: boolean;
}

export const createSupport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId, amount, message, isAnonymous = false }: CreateSupportRequest = req.body;

    // Validate required fields
    if (!campaignId || !amount) {
      throw createError('Campaign ID and amount are required', 400);
    }

    // Validate amount is positive
    if (amount <= 0) {
      throw createError('Amount must be a positive number', 400);
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

    // Check if campaign deadline has passed
    if (new Date() > campaign.deadline) {
      throw createError('Campaign deadline has passed', 400);
    }

    // Get or create user from Clerk
    let user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    // Create support
    const support = await prisma.support.create({
      data: {
        campaignId,
        userId: user.id,
        amount,
        message,
        isAnonymous
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
            title: true,
            goal: true,
            current: true
          }
        }
      }
    });

    // Update campaign current amount
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        current: {
          increment: amount
        }
      }
    });

    res.success(support, 201);
  } catch (error) {
    next(error);
  }
};

export const getSupportsByCampaign = async (
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

    const [supports, total] = await Promise.all([
      prisma.support.findMany({
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
      prisma.support.count({
        where: { campaignId }
      })
    ]);

    res.success(supports, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getSupportsByUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get user from Clerk
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    const [supports, total] = await Promise.all([
      prisma.support.findMany({
        where: { userId: user.id },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
              goal: true,
              current: true,
              deadline: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.support.count({
        where: { userId: user.id }
      })
    ]);

    res.success(supports, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};
