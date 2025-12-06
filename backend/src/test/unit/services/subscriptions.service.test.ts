import { SubscriptionsService } from '../../../services/subscriptions.service'
import { AppError } from '../../../utils/AppError'
import { prisma } from '../../../infrastructure/prisma'
import { stripe } from '../../../lib/stripe'

// Mock Prisma
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    project: { findUnique: jest.fn() },
    user: { upsert: jest.fn(), update: jest.fn() },
    subscription: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  },
}))

// Mock Stripe
jest.mock('../../../lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: jest.fn() } },
    accounts: { retrieve: jest.fn().mockResolvedValue({ id: 'acct_1' }) },
    subscriptions: { cancel: jest.fn(), update: jest.fn() },
  },
}))

const mockPrisma = prisma as any
const mockStripe = stripe as any

describe('SubscriptionsService', () => {
  let service: SubscriptionsService

  beforeEach(() => {
    service = new SubscriptionsService()
    jest.clearAllMocks()
    process.env.APP_BASE_URL = 'https://example.com'
  })

  it('creates subscription checkout successfully', async () => {
    const userId = 'u1'
    const project = {
      id: 'p1', title: 'Proj', deletedAt: null, status: 'PUBLISHED',
      subscriptionEnabled: true, subscriptionPriceCents: 990, subscriptionInterval: 'MONTH',
      ownerId: 'o1', owner: { stripeAccountId: 'acct_1' },
    }
    mockPrisma.project.findUnique.mockResolvedValue(project)
    mockPrisma.user.upsert.mockResolvedValue({ id: userId })
    mockPrisma.subscription.findUnique.mockResolvedValue(null)
    mockPrisma.subscription.create.mockResolvedValue({ id: 's1' })
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: 'https://stripe/session' })

    const res = await service.createCheckout({ projectId: 'p1' }, userId)
    expect(res).toEqual({ checkoutUrl: 'https://stripe/session', subscriptionId: 's1' })
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalled()
  })

  it('throws when project not found or deleted', async () => {
    const userId = 'u1'
    mockPrisma.project.findUnique.mockResolvedValue(null)
    await expect(service.createCheckout({ projectId: 'p1' }, userId)).rejects.toThrow(new AppError('Project not found', 404))

    mockPrisma.project.findUnique.mockResolvedValue({ deletedAt: new Date() })
    await expect(service.createCheckout({ projectId: 'p1' }, userId)).rejects.toThrow(new AppError('Project not found', 404))
  })

  it('throws when subscription not available or status not PUBLISHED', async () => {
    const userId = 'u1'
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'p1', deletedAt: null, status: 'DRAFT', subscriptionEnabled: true,
      subscriptionPriceCents: 990, subscriptionInterval: 'MONTH', ownerId: 'o1', owner: { stripeAccountId: 'acct_1' },
    })
    await expect(service.createCheckout({ projectId: 'p1' }, userId)).rejects.toThrow(new AppError('Project is not accepting subscriptions', 400))

    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'p1', deletedAt: null, status: 'PUBLISHED', subscriptionEnabled: false,
      ownerId: 'o1', owner: { stripeAccountId: 'acct_1' },
    })
    await expect(service.createCheckout({ projectId: 'p1' }, userId)).rejects.toThrow(new AppError('Subscription not available for this project', 400))
  })

  it('throws when owner not connected or stripe account stale', async () => {
    const userId = 'u1'
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'p1', title: 'T', deletedAt: null, status: 'PUBLISHED', subscriptionEnabled: true, subscriptionPriceCents: 990, subscriptionInterval: 'MONTH', ownerId: 'o1', owner: { stripeAccountId: null },
    })
    await expect(service.createCheckout({ projectId: 'p1' }, userId)).rejects.toThrow(new AppError('Campaign owner not connected to payouts', 422))

    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'p1', title: 'T', deletedAt: null, status: 'PUBLISHED', subscriptionEnabled: true, subscriptionPriceCents: 990, subscriptionInterval: 'MONTH', ownerId: 'o1', owner: { stripeAccountId: 'acct_1' },
    })
    mockStripe.accounts.retrieve.mockRejectedValueOnce({ message: 'No such account: acct_1', raw: { code: 'resource_missing' } })
    await expect(service.createCheckout({ projectId: 'p1' }, userId)).rejects.toThrow(new AppError('Campaign owner not connected to payouts', 422))
  })

  it('throws when campaign deadline has passed', async () => {
    const userId = 'u1'
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'p1', title: 'T', deletedAt: null, status: 'PUBLISHED',
      subscriptionEnabled: true, subscriptionPriceCents: 990, subscriptionInterval: 'MONTH',
      deadline: new Date(Date.now() - 3600_000),
      ownerId: 'o1', owner: { stripeAccountId: 'acct_1' },
    })
    await expect(service.createCheckout({ projectId: 'p1' }, userId)).rejects.toThrow(
      new AppError('Project is not accepting subscriptions', 400)
    )
  })

  it('uses YEAR interval label and hash router when configured', async () => {
    const userId = 'u1'
    process.env.APP_USE_HASH_ROUTER = 'true'
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'p1', title: 'Proj', deletedAt: null, status: 'PUBLISHED',
      subscriptionEnabled: true, subscriptionPriceCents: 990, subscriptionInterval: 'YEAR',
      ownerId: 'o1', owner: { stripeAccountId: 'acct_1' },
    })
    mockPrisma.user.upsert.mockResolvedValue({ id: userId })
    mockPrisma.subscription.findUnique.mockResolvedValue(null)
    mockPrisma.subscription.create.mockResolvedValue({ id: 's1' })
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: 'https://stripe/session' })

    await service.createCheckout({ projectId: 'p1' }, userId)

    const call = mockStripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.line_items[0].price_data.product_data.name).toContain('Anual')
    expect(call.success_url).toContain('/#/subscribe/success')
    expect(call.cancel_url).toContain('/#/subscribe/cancel')
  })

  it('omits application_fee_percent when PLATFORM_FEE_PERCENT is invalid', async () => {
    const userId = 'u1'
    process.env.PLATFORM_FEE_PERCENT = 'abc'
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'p1', title: 'T', deletedAt: null, status: 'PUBLISHED',
      subscriptionEnabled: true, subscriptionPriceCents: 990, subscriptionInterval: 'MONTH',
      ownerId: 'o1', owner: { stripeAccountId: 'acct_1' },
    })
    mockPrisma.user.upsert.mockResolvedValue({ id: userId })
    mockPrisma.subscription.findUnique.mockResolvedValue(null)
    mockPrisma.subscription.create.mockResolvedValue({ id: 's1' })
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: 'https://stripe/session' })

    await service.createCheckout({ projectId: 'p1' }, userId)

    const call = mockStripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.subscription_data).not.toHaveProperty('application_fee_percent')
  })

  it('rethrows unexpected Stripe account error', async () => {
    const userId = 'u1'
    const unexpected = new Error('boom')
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'p1', title: 'T', deletedAt: null, status: 'PUBLISHED',
      subscriptionEnabled: true, subscriptionPriceCents: 990, subscriptionInterval: 'MONTH',
      ownerId: 'o1', owner: { stripeAccountId: 'acct_1' },
    })
    mockStripe.accounts.retrieve.mockRejectedValueOnce(unexpected)

    await expect(service.createCheckout({ projectId: 'p1' }, userId)).rejects.toBe(unexpected)
  })

  it('respects custom successUrl and cancelUrl when provided', async () => {
    const userId = 'u1'
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'p1', title: 'T', deletedAt: null, status: 'PUBLISHED',
      subscriptionEnabled: true, subscriptionPriceCents: 990, subscriptionInterval: 'MONTH',
      ownerId: 'o1', owner: { stripeAccountId: 'acct_1' },
    })
    mockPrisma.user.upsert.mockResolvedValue({ id: userId })
    mockPrisma.subscription.findUnique.mockResolvedValue(null)
    mockPrisma.subscription.create.mockResolvedValue({ id: 's1' })
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: 'https://stripe/session' })

    const data = { projectId: 'p1', successUrl: 'https://ok/s', cancelUrl: 'https://ok/c' }
    await service.createCheckout(data, userId)

    const call = mockStripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.success_url).toBe('https://ok/s')
    expect(call.cancel_url).toBe('https://ok/c')
  })

  it('cancels subscription immediately when cancelAtPeriodEnd = false', async () => {
    const userId = 'u1'
    mockPrisma.subscription.findUnique.mockResolvedValue({ id: 's1', subscriberId: userId, stripeSubscriptionId: 'sub_123' })
    mockPrisma.subscription.update.mockResolvedValue({ id: 's1', status: 'CANCELED' })
    mockStripe.subscriptions.cancel.mockResolvedValue({ id: 'sub_123', status: 'canceled' })

    const res = await service.cancelSubscription('s1', userId, false)
    expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith('sub_123')
    expect(mockPrisma.subscription.update).toHaveBeenCalled()
    expect(res).toEqual({ id: 's1', status: 'CANCELED' })
  })

  it('schedules cancel at period end when cancelAtPeriodEnd = true', async () => {
    const userId = 'u1'
    mockPrisma.subscription.findUnique.mockResolvedValue({ id: 's1', subscriberId: userId, stripeSubscriptionId: 'sub_123' })
    mockPrisma.subscription.update.mockResolvedValue({ id: 's1', status: 'CANCELED' })
    mockStripe.subscriptions.update.mockResolvedValue({ id: 'sub_123', cancel_at_period_end: true })

    await service.cancelSubscription('s1', userId, true)
    expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_123', { cancel_at_period_end: true })
  })

  it('updates local status without hitting Stripe when no stripeSubscriptionId', async () => {
    const userId = 'u1'
    mockPrisma.subscription.findUnique.mockResolvedValue({ id: 's1', subscriberId: userId, stripeSubscriptionId: null })
    mockPrisma.subscription.update.mockResolvedValue({ id: 's1', status: 'CANCELED' })

    await service.cancelSubscription('s1', userId)

    expect(mockStripe.subscriptions.cancel).not.toHaveBeenCalled()
    expect(mockStripe.subscriptions.update).not.toHaveBeenCalled()
    expect(mockPrisma.subscription.update).toHaveBeenCalled()
  })

  it('throws 404 when subscription not found', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue(null)
    await expect(service.cancelSubscription('s1', 'u1', false)).rejects.toThrow(new AppError('Subscription not found', 404))
  })

  it('throws 403 when trying to cancel subscription from another user', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({ id: 's1', subscriberId: 'other', stripeSubscriptionId: 'sub_123' })
    await expect(service.cancelSubscription('s1', 'u1', false)).rejects.toThrow(new AppError('Forbidden', 403))
  })
})


