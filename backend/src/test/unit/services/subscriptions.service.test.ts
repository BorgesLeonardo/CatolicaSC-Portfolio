import { SubscriptionsService } from '../../../services/subscriptions.service'
import { AppError } from '../../../utils/AppError'
import { prisma } from '../../../infrastructure/prisma'
import { stripe } from '../../../lib/stripe'

// Mock Prisma
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    project: { findUnique: jest.fn() },
    user: { upsert: jest.fn(), update: jest.fn() },
    subscription: { findUnique: jest.fn(), create: jest.fn() },
  },
}))

// Mock Stripe
jest.mock('../../../lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: jest.fn() } },
    accounts: { retrieve: jest.fn().mockResolvedValue({ id: 'acct_1' }) },
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
})


