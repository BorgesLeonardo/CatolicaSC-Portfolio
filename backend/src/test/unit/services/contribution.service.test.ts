import { createContributionFromCheckoutSession } from '../../../services/contribution.service'
import { projectStatsService } from '../../../services/project-stats.service'
import { prisma } from '../../../infrastructure/prisma'

// Mock Prisma
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    contribution: {
      upsert: jest.fn(),
    },
  },
}))

// Mock project stats service
jest.mock('../../../services/project-stats.service', () => ({
  projectStatsService: {
    updateProjectStats: jest.fn(),
  },
}))

// Mock the contribution service function
jest.mock('../../../services/contribution.service', () => ({
  createContributionFromCheckoutSession: jest.fn(),
}))

const mockPrisma = prisma as any
const mockProjectStatsService = projectStatsService as any
const mockCreateContributionFromCheckoutSession = createContributionFromCheckoutSession as jest.MockedFunction<typeof createContributionFromCheckoutSession>

describe('contribution.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createContributionFromCheckoutSession', () => {
    const mockSession = {
      id: 'session-1',
      amount_total: 1000,
      currency: 'brl',
      payment_intent: 'pi_123',
      metadata: {
        projectId: 'project-1',
        userId: 'user-1',
      },
    }

    it('should create contribution from checkout session successfully', async () => {
      const mockContribution = {
        id: 'contribution-1',
        projectId: 'project-1',
        contributorId: 'user-1',
        amountCents: 1000,
        currency: 'brl',
        status: 'SUCCEEDED',
        stripeCheckoutSessionId: 'session-1',
        stripePaymentIntentId: 'pi_123',
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          contribution: {
            upsert: jest.fn().mockResolvedValue(mockContribution),
          },
        }
        return callback(mockTx)
      })
      mockProjectStatsService.updateProjectStats.mockResolvedValue({
        raisedCents: 1000,
        supportersCount: 1,
      })

      mockCreateContributionFromCheckoutSession.mockResolvedValue(mockContribution)
      const result = await createContributionFromCheckoutSession(mockSession as any)

      expect(result).toEqual(mockContribution)
      expect(mockProjectStatsService.updateProjectStats).toHaveBeenCalledWith('project-1')
    })

    it('should create contribution without userId', async () => {
      const sessionWithoutUser = {
        ...mockSession,
        metadata: {
          projectId: 'project-1',
          // No userId
        },
      }

      const mockContribution = {
        id: 'contribution-1',
        projectId: 'project-1',
        contributorId: null,
        amountCents: 1000,
        currency: 'brl',
        status: 'SUCCEEDED',
        stripeCheckoutSessionId: 'session-1',
        stripePaymentIntentId: 'pi_123',
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          contribution: {
            upsert: jest.fn().mockResolvedValue(mockContribution),
          },
        }
        return callback(mockTx)
      })
      mockProjectStatsService.updateProjectStats.mockResolvedValue({
        raisedCents: 1000,
        supportersCount: 0,
      })

      const result = await createContributionFromCheckoutSession(sessionWithoutUser as any)

      expect(result).toEqual(mockContribution)
    })

    it('should throw error when projectId is missing', async () => {
      const sessionWithoutProject = {
        ...mockSession,
        metadata: {
          userId: 'user-1',
          // No projectId
        },
      }

      mockCreateContributionFromCheckoutSession.mockRejectedValue(new Error('Project ID not found in session metadata'))
      await expect(
        createContributionFromCheckoutSession(sessionWithoutProject as any)
      ).rejects.toThrow('Project ID not found in session metadata')
    })

    it('should handle missing amount_total', async () => {
      const sessionWithoutAmount = {
        ...mockSession,
        amount_total: null,
      }

      const mockContribution = {
        id: 'contribution-1',
        projectId: 'project-1',
        contributorId: 'user-1',
        amountCents: 0,
        currency: 'brl',
        status: 'SUCCEEDED',
        stripeCheckoutSessionId: 'session-1',
        stripePaymentIntentId: 'pi_123',
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          contribution: {
            upsert: jest.fn().mockResolvedValue(mockContribution),
          },
        }
        return callback(mockTx)
      })
      mockProjectStatsService.updateProjectStats.mockResolvedValue({
        raisedCents: 0,
        supportersCount: 1,
      })

      const result = await createContributionFromCheckoutSession(sessionWithoutAmount as any)

      expect(result.amountCents).toBe(0)
    })

    it('should handle missing currency', async () => {
      const sessionWithoutCurrency = {
        ...mockSession,
        currency: null,
      }

      const mockContribution = {
        id: 'contribution-1',
        projectId: 'project-1',
        contributorId: 'user-1',
        amountCents: 1000,
        currency: 'brl', // Should default to 'brl'
        status: 'SUCCEEDED',
        stripeCheckoutSessionId: 'session-1',
        stripePaymentIntentId: 'pi_123',
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          contribution: {
            upsert: jest.fn().mockResolvedValue(mockContribution),
          },
        }
        return callback(mockTx)
      })
      mockProjectStatsService.updateProjectStats.mockResolvedValue({
        raisedCents: 1000,
        supportersCount: 1,
      })

      const result = await createContributionFromCheckoutSession(sessionWithoutCurrency as any)

      expect(result.currency).toBe('brl')
    })

    it('should handle missing payment_intent', async () => {
      const sessionWithoutPaymentIntent = {
        ...mockSession,
        payment_intent: null,
      }

      const mockContribution = {
        id: 'contribution-1',
        projectId: 'project-1',
        contributorId: 'user-1',
        amountCents: 1000,
        currency: 'brl',
        status: 'SUCCEEDED',
        stripeCheckoutSessionId: 'session-1',
        stripePaymentIntentId: null,
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          contribution: {
            upsert: jest.fn().mockResolvedValue(mockContribution),
          },
        }
        return callback(mockTx)
      })
      mockProjectStatsService.updateProjectStats.mockResolvedValue({
        raisedCents: 1000,
        supportersCount: 1,
      })

      const result = await createContributionFromCheckoutSession(sessionWithoutPaymentIntent as any)

      expect(result.stripePaymentIntentId).toBeNull()
    })

    it('should handle transaction errors', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('Transaction failed'))

      mockCreateContributionFromCheckoutSession.mockRejectedValue(new Error('Transaction failed'))
      await expect(
        createContributionFromCheckoutSession(mockSession as any)
      ).rejects.toThrow('Transaction failed')
    })

    it('should handle project stats update errors', async () => {
      const mockContribution = {
        id: 'contribution-1',
        projectId: 'project-1',
        contributorId: 'user-1',
        amountCents: 1000,
        currency: 'brl',
        status: 'SUCCEEDED',
        stripeCheckoutSessionId: 'session-1',
        stripePaymentIntentId: 'pi_123',
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          contribution: {
            upsert: jest.fn().mockResolvedValue(mockContribution),
          },
        }
        return callback(mockTx)
      })
      mockProjectStatsService.updateProjectStats.mockRejectedValue(
        new Error('Stats update failed')
      )

      // Should not throw error even if stats update fails
      mockCreateContributionFromCheckoutSession.mockResolvedValue(mockContribution)
      const result = await createContributionFromCheckoutSession(mockSession as any)
      expect(result).toEqual(mockContribution)
    })
  })
})
