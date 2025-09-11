import { prisma } from '../infrastructure/prisma';
import { stripe } from '../lib/stripe';
import { AppError } from '../utils/AppError';

export interface CreateCheckoutData {
  projectId: string;
  amountCents: number;
  successUrl?: string | undefined;
  cancelUrl?: string | undefined;
}

export class ContributionsService {
  async createCheckout(data: CreateCheckoutData, userId: string) {
    const project = await prisma.project.findUnique({ 
      where: { id: data.projectId } 
    });
    
    if (!project || project.deletedAt) {
      throw new AppError('Project not found', 404);
    }
    
    if (project.deadline < new Date()) {
      throw new AppError('Project is closed', 400);
    }

    // Garante que o usuário existe
    await prisma.user.upsert({ 
      where: { id: userId }, 
      update: {}, 
      create: { id: userId } 
    });

    // Cria contribution PENDING
    const contribution = await prisma.contribution.create({
      data: {
        projectId: data.projectId,
        contributorId: userId,
        amountCents: data.amountCents,
        currency: process.env.STRIPE_CURRENCY || 'BRL',
        status: 'PENDING',
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'BRL',
          unit_amount: data.amountCents,
          product_data: {
            name: `Contribuição: ${project.title}`,
          },
        },
        quantity: 1,
      }],
      metadata: {
        contributionId: contribution.id,
        projectId: project.id,
        ownerId: project.ownerId,
      },
      success_url: data.successUrl ?? `${process.env.APP_BASE_URL}/contrib/success?c=${contribution.id}`,
      cancel_url: data.cancelUrl ?? `${process.env.APP_BASE_URL}/contrib/cancel?c=${contribution.id}`,
    });

    await prisma.contribution.update({
      where: { id: contribution.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return { 
      checkoutUrl: session.url, 
      contributionId: contribution.id 
    };
  }

  async listByProject(projectId: string, page: number = 1, pageSize: number = 10) {
    const where = { projectId };
    
    const [items, total] = await Promise.all([
      prisma.contribution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          contributor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.contribution.count({ where }),
    ]);

    return { page, pageSize, total, items };
  }
}
