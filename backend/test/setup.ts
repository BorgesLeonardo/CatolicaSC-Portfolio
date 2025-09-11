import { config } from 'dotenv'
config({ path: './test.env' })
import MockDate from 'mockdate'

MockDate.set('2025-01-01T00:00:00Z')

// Clerk (backend) – substitua pelo SDK usado no projeto
jest.mock('@clerk/express', () => ({
  clerkMiddleware: jest.fn(() => (req: any, res: any, next: any) => {
    req.auth = { userId: 'user_test_id' }
    next()
  }),
  getAuth: jest.fn((req: any) => {
    // Retorna userId baseado no header Authorization
    if (req?.headers?.authorization?.startsWith('Bearer')) {
      return { userId: 'user_test_id' }
    }
    return { userId: null }
  }),
}))

// Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test',
        client_secret: 'secret_test',
        amount: 1000,
        currency: 'usd',
      }),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test', metadata: { contributionId: 'contrib_test' } } }
      }),
    },
  }))
})

// Prisma (mock manual)
jest.mock('@prisma/client', () => require('../__mocks__/@prisma/client'))

jest.spyOn(console, 'error').mockImplementation(() => {})
jest.spyOn(console, 'warn').mockImplementation(() => {})
