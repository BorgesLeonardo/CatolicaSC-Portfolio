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
      where: { id: data.projectId },
      select: { id: true, title: true, deadline: true, ownerId: true, deletedAt: true, status: true, owner: { select: { stripeAccountId: true } } }
    });
    
    if (!project || project.deletedAt) {
      throw new AppError('Project not found', 404);
    }
    
    if (project.deadline < new Date()) {
      throw new AppError('Project is closed', 400);
    }
    if (project.status !== 'PUBLISHED') {
      throw new AppError('Project is not accepting contributions', 400);
    }

    // Check owner connect account
    const ownerStripeAccountId = project.owner?.stripeAccountId
    if (!ownerStripeAccountId) {
      throw new AppError('Campaign owner not connected to payouts', 422)
    }

    // Validate that the connected account exists under the current Stripe key; if not, clear it and ask to reconnect
    try {
      await stripe.accounts.retrieve(ownerStripeAccountId)
    } catch (err: any) {
      const msg = String(err?.message || '')
      const code = String(err?.raw?.code || err?.code || '')
      const isMissing = msg.includes('No such account') || msg.includes('does not have access to account') || code === 'resource_missing' || code === 'account_invalid'
      if (isMissing) {
        try { await prisma.user.update({ where: { id: project.ownerId }, data: { stripeAccountId: null } }) } catch {}
        throw new AppError('Campaign owner not connected to payouts', 422)
      }
      throw err
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

    const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || '5')
    const applicationFeeAmount = Math.floor((data.amountCents * (isNaN(platformFeePercent) ? 0 : platformFeePercent)) / 100)

    const paymentIntentData: any = {
      transfer_data: { destination: ownerStripeAccountId },
    }
    if (applicationFeeAmount > 0) {
      paymentIntentData.application_fee_amount = applicationFeeAmount
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create({
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
          userId,
        },
        payment_intent_data: paymentIntentData,
        success_url: data.successUrl ?? `${process.env.APP_BASE_URL}/contrib/success?c=${contribution.id}`,
        cancel_url: data.cancelUrl ?? `${process.env.APP_BASE_URL}/contrib/cancel?c=${contribution.id}`,
      });
    } catch (err: unknown) {
      const e = err as { message?: string; raw?: { code?: string; message?: string } };
      const msg = e?.raw?.message || e?.message || '';
      // Map common Stripe destination/account errors to 422 for better UX
      const destinationIssue = msg.toLowerCase().includes('destination') || msg.toLowerCase().includes('connected');
      const accountInvalid = e?.raw?.code === 'account_invalid' || e?.raw?.code === 'account_unverified';
      if (destinationIssue || accountInvalid) {
        throw new AppError('Campaign owner not connected to payouts', 422);
      }
      throw err;
    }

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

  async hasContributions(projectId: string): Promise<boolean> {
    const count = await prisma.contribution.count({
      where: {
        projectId,
        status: 'SUCCEEDED'
      }
    });
    
    return count > 0;
  }
}
