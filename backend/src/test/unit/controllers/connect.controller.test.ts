import { Request, Response, NextFunction } from 'express'
import { ConnectController } from '../../../controllers/connect.controller'
import { AppError } from '../../../utils/AppError'

jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Provide a rich mock for Stripe client used by ConnectController
jest.mock('../../../utils/stripeClient', () => ({
  stripe: {
    accounts: {
      create: jest.fn(),
      retrieve: jest.fn(),
      createLoginLink: jest.fn(),
    },
    accountLinks: {
      create: jest.fn(),
    },
  },
}))

const { prisma } = jest.requireMock('../../../infrastructure/prisma') as any
const { stripe } = jest.requireMock('../../../utils/stripeClient') as any

describe('ConnectController', () => {
  let controller: ConnectController
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    controller = new ConnectController()
    mockReq = {}
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()

    jest.clearAllMocks()
  })

  describe('onboard', () => {
    it('creates a new express account and onboarding link when user is not connected', async () => {
      ;(prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user_1', stripeAccountId: null })
      ;(stripe.accounts.create as jest.Mock).mockResolvedValue({ id: 'acct_new' })
      ;(stripe.accountLinks.create as jest.Mock).mockResolvedValue({ url: 'https://stripe.test/onboard' })

      ;(mockReq as any).authUserId = 'user_1'

      await controller.onboard(mockReq as Request, mockRes as Response, mockNext)

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        update: {},
        create: { id: 'user_1' },
      })
      expect(stripe.accounts.create).toHaveBeenCalledWith({ type: 'express' })
      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'user_1' }, data: { stripeAccountId: 'acct_new' } })
      expect(stripe.accountLinks.create).toHaveBeenCalledWith(
        expect.objectContaining({ account: 'acct_new', type: 'account_onboarding' }),
      )
      expect(mockRes.json).toHaveBeenCalledWith({ url: 'https://stripe.test/onboard' })
    })

    it('reuses existing account and returns onboarding link when already connected', async () => {
      ;(prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user_2', stripeAccountId: 'acct_123' })
      ;(stripe.accountLinks.create as jest.Mock).mockResolvedValue({ url: 'https://stripe.test/onboard2' })

      ;(mockReq as any).authUserId = 'user_2'

      await controller.onboard(mockReq as Request, mockRes as Response, mockNext)

      expect(stripe.accounts.create).not.toHaveBeenCalled()
      expect(prisma.user.update).not.toHaveBeenCalled()
      expect(stripe.accountLinks.create).toHaveBeenCalledWith(
        expect.objectContaining({ account: 'acct_123', type: 'account_onboarding' }),
      )
      expect(mockRes.json).toHaveBeenCalledWith({ url: 'https://stripe.test/onboard2' })
    })
  })

  describe('status', () => {
    it('returns not connected when user has no stripeAccountId', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_3', stripeAccountId: null })
      ;(mockReq as any).authUserId = 'user_3'

      await controller.status(mockReq as Request, mockRes as Response, mockNext)

      expect(mockRes.json).toHaveBeenCalledWith({ connected: false, chargesEnabled: false, payoutsEnabled: false })
    })

    it('returns connected status from Stripe', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_4', stripeAccountId: 'acct_789' })
      ;(stripe.accounts.retrieve as jest.Mock).mockResolvedValue({
        id: 'acct_789',
        charges_enabled: true,
        payouts_enabled: false,
        requirements: { current_deadline: null },
      })
      ;(mockReq as any).authUserId = 'user_4'

      await controller.status(mockReq as Request, mockRes as Response, mockNext)

      expect(stripe.accounts.retrieve).toHaveBeenCalledWith('acct_789')
      expect(mockRes.json).toHaveBeenCalledWith({
        connected: true,
        chargesEnabled: true,
        payoutsEnabled: false,
        requirements: { current_deadline: null },
      })
    })
  })

  describe('dashboardLink', () => {
    it('throws 404 when account not found', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_5', stripeAccountId: null })
      ;(mockReq as any).authUserId = 'user_5'

      await controller.dashboardLink(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
      const err = (mockNext as jest.Mock).mock.calls[0][0] as AppError
      expect(err.statusCode).toBe(404)
    })

    it('returns login link url when account exists', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_6', stripeAccountId: 'acct_999' })
      ;(stripe.accounts.createLoginLink as jest.Mock).mockResolvedValue({ url: 'https://stripe.test/login' })
      ;(mockReq as any).authUserId = 'user_6'

      await controller.dashboardLink(mockReq as Request, mockRes as Response, mockNext)

      expect(stripe.accounts.createLoginLink).toHaveBeenCalledWith('acct_999')
      expect(mockRes.json).toHaveBeenCalledWith({ url: 'https://stripe.test/login' })
    })
  })
})



