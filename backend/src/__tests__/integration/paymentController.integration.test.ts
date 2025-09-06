import request from 'supertest';
import { Express } from 'express';
import { testPrisma, cleanupTestDatabase, seedTestDatabase } from '../../config/testDatabase';
import { createApp } from '../../app';

describe('Payment Controller Integration Tests', () => {
  let app: Express;
  let testData: any;

  beforeAll(async () => {
    app = createApp();
    await cleanupTestDatabase();
    testData = await seedTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await cleanupTestDatabase();
    testData = await seedTestDatabase();
  });

  describe('POST /api/payments/qr-code', () => {
    it('should generate QR code for valid payment', async () => {
      const campaign = testData.campaigns[0];
      const paymentData = {
        campaignId: campaign.id,
        amount: 100.00,
        description: 'Test payment',
      };

      const response = await request(app)
        .post('/api/payments/qr-code')
        .set('Authorization', 'Bearer test-token')
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qrCode).toBeDefined();
      expect(response.body.data.paymentId).toBeDefined();
      expect(response.body.data.amount).toBe('100');
    });

    it('should return 400 for invalid amount', async () => {
      const campaign = testData.campaigns[0];
      const paymentData = {
        campaignId: campaign.id,
        amount: -100.00,
        description: 'Test payment',
      };

      const response = await request(app)
        .post('/api/payments/qr-code')
        .set('Authorization', 'Bearer test-token')
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent campaign', async () => {
      const paymentData = {
        campaignId: 'non-existent-id',
        amount: 100.00,
        description: 'Test payment',
      };

      const response = await request(app)
        .post('/api/payments/qr-code')
        .set('Authorization', 'Bearer test-token')
        .send(paymentData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/payments/confirm', () => {
    it('should confirm a valid payment', async () => {
      const campaign = testData.campaigns[0];
      const user = testData.users[0];

      // First create a payment
      const qrResponse = await request(app)
        .post('/api/payments/qr-code')
        .set('Authorization', 'Bearer test-token')
        .send({
          campaignId: campaign.id,
          amount: 100.00,
          description: 'Test payment',
        });

      const paymentId = qrResponse.body.data.paymentId;

      // Then confirm it
      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', 'Bearer test-token')
        .send({ paymentId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');

      // Verify support was created in database
      const support = await testPrisma.support.findFirst({
        where: { campaignId: campaign.id }
      });
      expect(support).toBeDefined();
      expect(support?.amount).toBe(100.00);

      // Verify campaign current amount was updated
      const updatedCampaign = await testPrisma.campaign.findUnique({
        where: { id: campaign.id }
      });
      expect(updatedCampaign?.current).toBe(100.00);
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', 'Bearer test-token')
        .send({ paymentId: 'non-existent-id' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/payments/create', () => {
    it('should create payment preference with Mercado Pago', async () => {
      const campaign = testData.campaigns[0];
      const paymentData = {
        campaignId: campaign.id,
        amount: 150.00,
        description: 'Test Mercado Pago payment',
        paymentMethod: 'credit_card',
        installments: 1,
        payerEmail: 'test@example.com',
        payerName: 'Test User',
        payerDocument: '12345678901',
      };

      const response = await request(app)
        .post('/api/payments/create')
        .set('Authorization', 'Bearer test-token')
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferenceId).toBeDefined();
      expect(response.body.data.initPoint).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const paymentData = {
        campaignId: testData.campaigns[0].id,
        amount: 150.00,
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/payments/create')
        .set('Authorization', 'Bearer test-token')
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should process webhook data', async () => {
      const campaign = testData.campaigns[0];
      const user = testData.users[0];

      const webhookData = {
        type: 'payment',
        data: {
          id: 'test-payment-id'
        }
      };

      // Mock the getPaymentById function
      jest.spyOn(require('../../config/mercadoPago'), 'getPaymentById')
        .mockResolvedValue({
          id: 'test-payment-id',
          status: 'approved',
          transactionAmount: 200.00,
          paymentMethodId: 'credit_card',
          installments: 1,
          externalReference: `${campaign.id}_${user.id}`,
          dateApproved: new Date().toISOString(),
        });

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.message).toBe('Webhook processed successfully');
      expect(response.body.supportId).toBeDefined();
    });
  });

  describe('GET /api/payments/status/:paymentId', () => {
    it('should return payment status', async () => {
      const campaign = testData.campaigns[0];

      // Create a payment first
      const qrResponse = await request(app)
        .post('/api/payments/qr-code')
        .set('Authorization', 'Bearer test-token')
        .send({
          campaignId: campaign.id,
          amount: 100.00,
          description: 'Test payment',
        });

      const paymentId = qrResponse.body.data.paymentId;

      const response = await request(app)
        .get(`/api/payments/status/${paymentId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentId).toBe(paymentId);
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/status/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
