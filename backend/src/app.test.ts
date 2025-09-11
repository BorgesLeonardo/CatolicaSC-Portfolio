import request from 'supertest'
import app from './app'
import { prisma } from './infrastructure/prisma'
import { stripe } from './lib/stripe'

// Mock do Prisma
const mockPrisma = prisma as any
const mockStripe = stripe as any

describe('App Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /health', () => {
    it('retorna status ok', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200)

      expect(res.body).toEqual({ ok: true })
    })
  })

  describe('POST /api/stripe/webhook', () => {
    it('processa checkout.session.completed com sucesso', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: { contributionId: 'contrib_123' },
            payment_intent: 'pi_test_123'
          }
        }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)
      mockPrisma.contribution.update.mockResolvedValue({})

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'test_signature')
        .send(JSON.stringify(mockEvent))
        .set('Content-Type', 'application/json')
        .expect(200)

      expect(mockPrisma.contribution.update).toHaveBeenCalledWith({
        where: { id: 'contrib_123' },
        data: {
          status: 'SUCCEEDED',
          stripePaymentIntentId: 'pi_test_123',
          stripeCheckoutSessionId: 'cs_test_123'
        }
      })
      expect(res.body).toEqual({ received: true })
    })

    it('processa payment_intent.payment_failed', async () => {
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: { id: 'pi_test_123' }
        }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)
      mockPrisma.contribution.findFirst.mockResolvedValue({ id: 'contrib_123' })
      mockPrisma.contribution.update.mockResolvedValue({})

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'test_signature')
        .send(JSON.stringify(mockEvent))
        .set('Content-Type', 'application/json')
        .expect(200)

      expect(mockPrisma.contribution.findFirst).toHaveBeenCalledWith({
        where: { stripePaymentIntentId: 'pi_test_123' }
      })
      expect(mockPrisma.contribution.update).toHaveBeenCalledWith({
        where: { id: 'contrib_123' },
        data: { status: 'FAILED' }
      })
      expect(res.body).toEqual({ received: true })
    })

    it('processa charge.refunded', async () => {
      const mockEvent = {
        type: 'charge.refunded',
        data: {
          object: { payment_intent: 'pi_test_123' }
        }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)
      mockPrisma.contribution.findFirst.mockResolvedValue({ id: 'contrib_123' })
      mockPrisma.contribution.update.mockResolvedValue({})

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'test_signature')
        .send(JSON.stringify(mockEvent))
        .set('Content-Type', 'application/json')
        .expect(200)

      expect(mockPrisma.contribution.findFirst).toHaveBeenCalledWith({
        where: { stripePaymentIntentId: 'pi_test_123' }
      })
      expect(mockPrisma.contribution.update).toHaveBeenCalledWith({
        where: { id: 'contrib_123' },
        data: { status: 'REFUNDED' }
      })
      expect(res.body).toEqual({ received: true })
    })

    it('ignora eventos desconhecidos', async () => {
      const mockEvent = {
        type: 'unknown.event',
        data: { object: {} }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'test_signature')
        .send(JSON.stringify(mockEvent))
        .set('Content-Type', 'application/json')
        .expect(200)

      expect(res.body).toEqual({ received: true })
    })

    it('retorna 500 quando webhook secret não configurado', async () => {
      const originalEnv = process.env.STRIPE_WEBHOOK_SECRET
      delete process.env.STRIPE_WEBHOOK_SECRET

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'test_signature')
        .send('{}')
        .set('Content-Type', 'application/json')
        .expect(500)

      expect(res.text).toBe('Missing webhook secret')

      process.env.STRIPE_WEBHOOK_SECRET = originalEnv
    })

    it('retorna 400 quando webhook signature inválida', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'invalid_signature')
        .send('{}')
        .set('Content-Type', 'application/json')
        .expect(400)

      expect(res.text).toBe('Webhook Error: Invalid signature')
    })

    it('retorna 500 quando erro interno no processamento', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: { contributionId: 'contrib_123' },
            payment_intent: 'pi_test_123'
          }
        }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)
      mockPrisma.contribution.update.mockRejectedValue(new Error('Database error'))

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'test_signature')
        .send(JSON.stringify(mockEvent))
        .set('Content-Type', 'application/json')
        .expect(500)

      expect(res.body).toEqual({ error: 'WebhookHandlingError' })
    })
  })
})
