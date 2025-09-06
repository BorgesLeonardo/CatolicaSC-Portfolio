import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export interface CreateUserRequest {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { clerkId, email, firstName, lastName, imageUrl }: CreateUserRequest = req.body;

    // Validate required fields
    if (!clerkId || !email) {
      throw createError('Clerk ID and email are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError('Invalid email format', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (existingUser) {
      throw createError('User already exists', 409);
    }

    // Check if email is already taken
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      throw createError('Email already in use', 409);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName,
        lastName,
        imageUrl
      }
    });

    res.success(user, 201);
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user from Clerk
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    res.success(user);
  } catch (error) {
    next(error);
  }
};

export const getUserDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user from Clerk
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    // Get user's campaigns
    const campaigns = await prisma.campaign.findMany({
      where: { authorId: user.id },
      include: {
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
      orderBy: { createdAt: 'desc' }
    });

    // Get user's supports
    const supports = await prisma.support.findMany({
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
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const totalCampaigns = campaigns.length;
    const totalSupports = supports.length;
    const totalRaised = campaigns.reduce((sum, campaign) => {
      return sum + Number(campaign.current);
    }, 0);

    const totalSupported = supports.reduce((sum, support) => {
      return sum + Number(support.amount);
    }, 0);

    const dashboard = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt
      },
      campaigns,
      supports,
      stats: {
        totalCampaigns,
        totalSupports,
        totalRaised: totalRaised.toString(),
        totalSupported: totalSupported.toString()
      }
    };

    res.success(dashboard);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updateData: UpdateUserRequest = req.body;

    // Get user from Clerk
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    res.success(updatedUser);
  } catch (error) {
    next(error);
  }
};
