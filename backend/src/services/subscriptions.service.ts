import { prisma } from '../infrastructure/prisma';
import { AppError } from '../utils/AppError';
import { stripe } from '../lib/stripe';

export interface CreateSubscriptionCheckoutData {
  projectId: string;
  successUrl?: string | undefined;
  cancelUrl?: string | undefined;
}

export class SubscriptionsService {
  async createCheckout(data: CreateSubscriptionCheckoutData, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        status: true,
        subscriptionEnabled: true,
        subscriptionPriceCents: true,
        subscriptionInterval: true,
        ownerId: true,
        owner: { select: { stripeAccountId: true } },
      },
    });

    if (!project || project.deletedAt) {
      throw new AppError('Project not found', 404);
    }

    if (!project.subscriptionEnabled || !project.subscriptionPriceCents || !project.subscriptionInterval) {
      throw new AppError('Subscription not available for this project', 400);
    }

    // Only allow subscriptions when campaign is ACTIVE (PUBLISHED)
    if (project.status !== 'PUBLISHED') {
      throw new AppError('Project is not accepting subscriptions', 400);
    }

    const ownerStripeAccountId = project.owner?.stripeAccountId;
    if (!ownerStripeAccountId) {
      throw new AppError('Campaign owner not connected to payouts', 422);
    }
    // Validate the connected account under current key; clear if stale
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

    // Ensure subscriber user exists
    await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });

    // Upsert one subscription per (projectId, subscriberId)
    let subscription = await prisma.subscription.findUnique({
      where: { projectId_subscriberId: { projectId: project.id, subscriberId: userId } },
    });
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          projectId: project.id,
          subscriberId: userId,
          priceCents: project.subscriptionPriceCents,
          interval: project.subscriptionInterval,
          status: 'INCOMPLETE',
        },
      });
    }

    const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || '5');

    // Create Checkout Session for subscription
    const intervalPt = project.subscriptionInterval === 'YEAR' ? 'Anual' : 'Mensal'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: (process.env.STRIPE_CURRENCY || 'BRL').toLowerCase(),
            recurring: { interval: project.subscriptionInterval.toLowerCase() as 'month' | 'year' },
            unit_amount: project.subscriptionPriceCents,
            product_data: { name: `Assinatura ${intervalPt}: ${project.title}` },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        transfer_data: { destination: ownerStripeAccountId },
        ...(isNaN(platformFeePercent) ? {} : { application_fee_percent: platformFeePercent }),
        metadata: {
          projectId: project.id,
          ownerId: project.ownerId,
          userId,
          subscriptionId: subscription.id,
        },
      },
      // Build frontend URL considering hash router when enabled via env
      success_url: (() => {
        if (data.successUrl) return data.successUrl
        const base = (process.env.APP_BASE_URL || '').replace(/\/$/, '')
        const hashPrefix = (process.env.APP_USE_HASH_ROUTER || 'false') === 'true' ? '/#' : ''
        return `${base}${hashPrefix}/subscribe/success?s=${subscription.id}`
      })(),
      cancel_url: (() => {
        if (data.cancelUrl) return data.cancelUrl
        const base = (process.env.APP_BASE_URL || '').replace(/\/$/, '')
        const hashPrefix = (process.env.APP_USE_HASH_ROUTER || 'false') === 'true' ? '/#' : ''
        return `${base}${hashPrefix}/subscribe/cancel?s=${subscription.id}`
      })(),
      metadata: {
        projectId: project.id,
        ownerId: project.ownerId,
        userId,
        subscriptionId: subscription.id,
        mode: 'subscription',
      },
    });

    return { checkoutUrl: session.url!, subscriptionId: subscription.id };
  }

  async cancelSubscription(subscriptionId: string, userId: string, cancelAtPeriodEnd = false) {
    const subscription = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }
    if (subscription.subscriberId !== userId) {
      throw new AppError('Forbidden', 403);
    }

    // If we have a Stripe subscription, cancel it
    if (subscription.stripeSubscriptionId) {
      if (cancelAtPeriodEnd) {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: true });
      } else {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      }
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELED' },
    });

    return { id: updated.id, status: updated.status };
  }
}

export const subscriptionsService = new SubscriptionsService();


