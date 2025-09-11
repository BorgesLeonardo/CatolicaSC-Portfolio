import request from 'supertest'
import app from '../app'
import { prisma } from '../infrastructure/prisma'

// Mock do Prisma
const mockPrisma = prisma as any

// Mock do Stripe
jest.mock('../lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn()
      }
    }
  }
}))

import { stripe } from '../lib/stripe'
const mockStripe = stripe as any

describe('Contributions API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/contributions/checkout', () => {
    it('201 em sucesso com dados válidos', async () => {
      const fakeProject = {
        id: 'clr12345678901234567890123',
        title: 'Projeto Teste',
        ownerId: 'owner_user_id',
        deadline: new Date('2025-12-31T23:59:59.000Z'),
        deletedAt: null
      }

      const fakeContribution = {
        id: 'clr98765432109876543210987',
        projectId: 'clr12345678901234567890123',
        contributorId: 'user_test_id',
        amountCents: 10000,
        currency: 'BRL',
        status: 'PENDING',
        stripeCheckoutSessionId: null
      }

      const fakeSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      }

      mockPrisma.project.findUnique.mockResolvedValue(fakeProject)
      mockPrisma.user.upsert.mockResolvedValue({ id: 'user_test_id' })
      mockPrisma.contribution.create.mockResolvedValue(fakeContribution)
      mockStripe.checkout.sessions.create.mockResolvedValue(fakeSession)
      mockPrisma.contribution.update.mockResolvedValue({
        ...fakeContribution,
        stripeCheckoutSessionId: 'cs_test_123'
      })

      const res = await request(app)
        .post('/api/contributions/checkout')
        .set('Authorization', 'Bearer token_fake')
        .send({
          projectId: 'clr12345678901234567890123',
          amountCents: 10000,
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel'
        })
        .expect(201)

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'clr12345678901234567890123' }
      })
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user_test_id' },
        update: {},
        create: { id: 'user_test_id' }
      })
      expect(mockPrisma.contribution.create).toHaveBeenCalledWith({
        data: {
          projectId: 'clr12345678901234567890123',
          contributorId: 'user_test_id',
          amountCents: 10000,
          currency: 'BRL',
          status: 'PENDING'
        }
      })
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'BRL',
            unit_amount: 10000,
            product_data: {
              name: 'Contribuição: Projeto Teste'
            }
          },
          quantity: 1
        }],
        metadata: {
          contributionId: 'clr98765432109876543210987',
          projectId: 'clr12345678901234567890123',
          ownerId: 'owner_user_id'
        },
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      })
      expect(mockPrisma.contribution.update).toHaveBeenCalledWith({
        where: { id: 'clr98765432109876543210987' },
        data: { stripeCheckoutSessionId: 'cs_test_123' }
      })
      expect(res.body).toEqual({
        checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_123',
        contributionId: 'clr98765432109876543210987'
      })
    })

    it('usa URLs padrão quando não fornecidas', async () => {
      const fakeProject = {
        id: 'clr12345678901234567890123',
        title: 'Projeto Teste',
        ownerId: 'owner_user_id',
        deadline: new Date('2025-12-31T23:59:59.000Z'),
        deletedAt: null
      }

      const fakeContribution = {
        id: 'clr98765432109876543210987',
        projectId: 'clr12345678901234567890123',
        contributorId: 'user_test_id',
        amountCents: 10000,
        currency: 'BRL',
        status: 'PENDING',
        stripeCheckoutSessionId: null
      }

      const fakeSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      }

      // Mock environment variables
      const originalAppBaseUrl = process.env.APP_BASE_URL
      process.env.APP_BASE_URL = 'https://app.example.com'

      mockPrisma.project.findUnique.mockResolvedValue(fakeProject)
      mockPrisma.user.upsert.mockResolvedValue({ id: 'user_test_id' })
      mockPrisma.contribution.create.mockResolvedValue(fakeContribution)
      mockStripe.checkout.sessions.create.mockResolvedValue(fakeSession)
      mockPrisma.contribution.update.mockResolvedValue({
        ...fakeContribution,
        stripeCheckoutSessionId: 'cs_test_123'
      })

      await request(app)
        .post('/api/contributions/checkout')
        .set('Authorization', 'Bearer token_fake')
        .send({
          projectId: 'clr12345678901234567890123',
          amountCents: 10000
        })
        .expect(201)

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'BRL',
            unit_amount: 10000,
            product_data: {
              name: 'Contribuição: Projeto Teste'
            }
          },
          quantity: 1
        }],
        metadata: {
          contributionId: 'clr98765432109876543210987',
          projectId: 'clr12345678901234567890123',
          ownerId: 'owner_user_id'
        },
        success_url: 'https://app.example.com/contrib/success?c=clr98765432109876543210987',
        cancel_url: 'https://app.example.com/contrib/cancel?c=clr98765432109876543210987'
      })

      // Restore environment variable
      process.env.APP_BASE_URL = originalAppBaseUrl
    })

    it('400 em payload inválido', async () => {
      const res = await request(app)
        .post('/api/contributions/checkout')
        .set('Authorization', 'Bearer token_fake')
        .send({
          projectId: 'invalid-id',
          amountCents: 50 // muito baixo
        })
        .expect(400)

      expect(res.body).toHaveProperty('error', 'ValidationError')
      expect(res.body).toHaveProperty('issues')
    })

    it('404 quando projeto não existe', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null)

      const res = await request(app)
        .post('/api/contributions/checkout')
        .set('Authorization', 'Bearer token_fake')
        .send({
          projectId: 'clr12345678901234567890123',
          amountCents: 10000
        })
        .expect(404)

      expect(res.body).toHaveProperty('error', 'ProjectNotFound')
    })

    it('404 quando projeto foi deletado', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'clr12345678901234567890123',
        deletedAt: new Date()
      })

      const res = await request(app)
        .post('/api/contributions/checkout')
        .set('Authorization', 'Bearer token_fake')
        .send({
          projectId: 'clr12345678901234567890123',
          amountCents: 10000
        })
        .expect(404)

      expect(res.body).toHaveProperty('error', 'ProjectNotFound')
    })

    it('400 quando projeto está fechado (deadline passou)', async () => {
      const fakeProject = {
        id: 'clr12345678901234567890123',
        title: 'Projeto Teste',
        ownerId: 'owner_user_id',
        deadline: new Date('2020-01-01T00:00:00.000Z'), // data passada
        deletedAt: null
      }

      mockPrisma.project.findUnique.mockResolvedValue(fakeProject)

      const res = await request(app)
        .post('/api/contributions/checkout')
        .set('Authorization', 'Bearer token_fake')
        .send({
          projectId: 'clr12345678901234567890123',
          amountCents: 10000
        })
        .expect(400)

      expect(res.body).toHaveProperty('error', 'ProjectClosed')
    })

    it('401 quando não autenticado', async () => {
      const res = await request(app)
        .post('/api/contributions/checkout')
        .send({
          projectId: 'clr12345678901234567890123',
          amountCents: 10000
        })
        .expect(401)

      expect(res.body).toHaveProperty('error', 'Unauthorized')
    })
  })
})
