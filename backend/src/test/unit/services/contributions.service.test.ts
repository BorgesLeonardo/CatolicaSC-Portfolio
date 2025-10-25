import { ContributionsService } from '../../../services/contributions.service'
import { AppError } from '../../../utils/AppError'
import { prisma } from '../../../infrastructure/prisma'
import { stripe } from '../../../lib/stripe'

// Mock Prisma
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
    },
    user: {
      upsert: jest.fn(),
    },
    contribution: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

// Mock Stripe
jest.mock('../../../lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    accounts: {
      retrieve: jest.fn().mockResolvedValue({ id: 'acct_123' }),
    },
  },
}))

const mockPrisma = prisma as any
const mockStripe = stripe as any

describe('ContributionsService', () => {
  let service: ContributionsService

  beforeEach(() => {
    service = new ContributionsService()
    jest.clearAllMocks()
  })

  describe('createCheckout', () => {
    const mockData = {
      projectId: 'project-1',
      amountCents: 1000,
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    }

    it('should create checkout successfully', async () => {
      const userId = 'user-1'
      const mockProject = {
        id: 'project-1',
        title: 'Test Project',
        deadline: new Date(Date.now() + 86400000), // Tomorrow
        deletedAt: null,
        status: 'PUBLISHED',
        ownerId: 'owner-1',
        owner: { stripeAccountId: 'acct_123' },
      }
      const mockContribution = {
        id: 'contribution-1',
        projectId: 'project-1',
        contributorId: userId,
        amountCents: 1000,
        currency: 'BRL',
        status: 'PENDING',
      }
      const mockSession = {
        id: 'session-1',
        url: 'https://checkout.stripe.com/session-1',
      }

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)
      mockPrisma.user.upsert.mockResolvedValue({ id: userId } as any)
      mockPrisma.contribution.create.mockResolvedValue(mockContribution as any)
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any)
      mockPrisma.contribution.update.mockResolvedValue(mockContribution as any)

      const result = await service.createCheckout(mockData, userId)

      expect(result).toEqual({
        checkoutUrl: 'https://checkout.stripe.com/session-1',
        contributionId: 'contribution-1',
      })

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'project-1' } })
      )
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: userId },
        update: {},
        create: { id: userId },
      })
      expect(mockPrisma.contribution.create).toHaveBeenCalledWith({
        data: {
          projectId: 'project-1',
          contributorId: userId,
          amountCents: 1000,
          currency: 'BRL',
          status: 'PENDING',
        },
      })
    })

    it('should throw AppError when project not found', async () => {
      const userId = 'user-1'
      mockPrisma.project.findUnique.mockResolvedValue(null)

      await expect(service.createCheckout(mockData, userId)).rejects.toThrow(
        new AppError('Project not found', 404)
      )
    })

    it('should throw AppError when project is deleted', async () => {
      const userId = 'user-1'
      const mockProject = {
        id: 'project-1',
        title: 'Test Project',
        deadline: new Date(Date.now() + 86400000),
        deletedAt: new Date(), // Deleted project
      }

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)

      await expect(service.createCheckout(mockData, userId)).rejects.toThrow(
        new AppError('Project not found', 404)
      )
    })

    it('should throw AppError when project is closed', async () => {
      const userId = 'user-1'
      const mockProject = {
        id: 'project-1',
        title: 'Test Project',
        deadline: new Date(Date.now() - 86400000), // Yesterday (closed)
        deletedAt: null,
      }

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)

      await expect(service.createCheckout(mockData, userId)).rejects.toThrow(
        new AppError('Project is closed', 400)
      )
    })

    it('should use default URLs when not provided', async () => {
      const userId = 'user-1'
      const dataWithoutUrls = {
        projectId: 'project-1',
        amountCents: 1000,
      }
      const mockProject = {
        id: 'project-1',
        title: 'Test Project',
        deadline: new Date(Date.now() + 86400000),
        deletedAt: null,
        ownerId: 'owner-1',
        status: 'PUBLISHED',
        owner: { stripeAccountId: 'acct_123' },
      }
      const mockContribution = {
        id: 'contribution-1',
        projectId: 'project-1',
        contributorId: userId,
        amountCents: 1000,
        currency: 'BRL',
        status: 'PENDING',
      }
      const mockSession = {
        id: 'session-1',
        url: 'https://checkout.stripe.com/session-1',
      }

      // Mock environment variables
      process.env.APP_BASE_URL = 'https://example.com'

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)
      mockPrisma.user.upsert.mockResolvedValue({ id: userId } as any)
      mockPrisma.contribution.create.mockResolvedValue(mockContribution as any)
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any)
      mockPrisma.contribution.update.mockResolvedValue(mockContribution as any)

      await service.createCheckout(dataWithoutUrls as any, userId)

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'BRL',
            unit_amount: 1000,
            product_data: {
              name: 'Contribuição: Test Project',
            },
          },
          quantity: 1,
        }],
        metadata: {
          contributionId: 'contribution-1',
          projectId: 'project-1',
          ownerId: 'owner-1',
          userId: userId,
        },
        payment_intent_data: expect.any(Object),
        success_url: 'https://example.com/contrib/success?c=contribution-1',
        cancel_url: 'https://example.com/contrib/cancel?c=contribution-1',
      })
    })
  })

  describe('listByProject', () => {
    it('should list contributions with default pagination', async () => {
      const projectId = 'project-1'
      const mockContributions = [
        { id: 'contrib-1', amountCents: 1000, status: 'SUCCEEDED' },
        { id: 'contrib-2', amountCents: 2000, status: 'SUCCEEDED' },
      ]
      const mockCount = 2

      mockPrisma.contribution.findMany.mockResolvedValue(mockContributions as any)
      mockPrisma.contribution.count.mockResolvedValue(mockCount)

      const result = await service.listByProject(projectId)

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
        items: mockContributions,
      })

      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          contributor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })

    it('should list contributions with custom pagination', async () => {
      const projectId = 'project-1'
      const page = 2
      const pageSize = 5
      const mockContributions = [
        { id: 'contrib-1', amountCents: 1000, status: 'SUCCEEDED' },
      ]
      const mockCount = 12

      mockPrisma.contribution.findMany.mockResolvedValue(mockContributions as any)
      mockPrisma.contribution.count.mockResolvedValue(mockCount)

      const result = await service.listByProject(projectId, page, pageSize)

      expect(result).toEqual({
        page: 2,
        pageSize: 5,
        total: 12,
        items: mockContributions,
      })

      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip: 5, // (page - 1) * pageSize
        take: 5,
        include: {
          contributor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })

    it('should handle negative page values', async () => {
      const projectId = 'project-1'
      const mockContributions: any[] = []
      const mockCount = 0

      mockPrisma.contribution.findMany.mockResolvedValue(mockContributions as any)
      mockPrisma.contribution.count.mockResolvedValue(mockCount)

      // Test negative page - service doesn't clamp, so it will use the negative value
      await service.listByProject(projectId, -1, 10)
      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: -20, // (page - 1) * pageSize = (-1 - 1) * 10 = -20
        })
      )

      // Test large pageSize - service doesn't clamp, so it will use the large value
      await service.listByProject(projectId, 1, 1000)
      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1000, // Service doesn't clamp this value
        })
      )
    })
  })

  describe('hasContributions', () => {
    it('should return true when project has contributions', async () => {
      const projectId = 'project-1'
      const mockCount = 5

      mockPrisma.contribution.count.mockResolvedValue(mockCount)

      const result = await service.hasContributions(projectId)

      expect(result).toBe(true)
      expect(mockPrisma.contribution.count).toHaveBeenCalledWith({
        where: { projectId, status: 'SUCCEEDED' },
      })
    })

    it('should return false when project has no contributions', async () => {
      const projectId = 'project-1'
      const mockCount = 0

      mockPrisma.contribution.count.mockResolvedValue(mockCount)

      const result = await service.hasContributions(projectId)

      expect(result).toBe(false)
    })
  })
})
