import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Payment Controller', () => {
  let authToken: string;
  let userId: string;
  let campaignId: string;

  beforeAll(async () => {
    authToken = 'mock-jwt-token';
    userId = 'test-user-id';
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.support.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.user.deleteMany();

    // Create test user and campaign
    await prisma.user.create({
      data: {
        id: userId,
        clerkId: 'clerk-test-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }
    });

    const campaign = await prisma.campaign.create({
      data: {
        title: 'Test Campaign',
        description: 'Test Description',
        goal: 1000,
        deadline: new Date('2024-12-31'),
        authorId: userId
      }
    });
    campaignId = campaign.id;
  });

  describe('POST /api/payments/qr-code', () => {
    it('should generate QR code for payment with valid data', async () => {
      const paymentData = {
        campaignId,
        amount: 50.00,
        description: 'Support for Test Campaign'
      };

      const response = await request(app)
        .post('/api/payments/qr-code')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        qrCode: expect.any(String),
        paymentId: expect.any(String),
        amount: paymentData.amount.toString(),
        campaignId: campaignId
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/payments/qr-code')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('required');
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .post('/api/payments/qr-code')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          campaignId: 'non-existent-id',
          amount: 50.00
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .post('/api/payments/qr-code')
        .send({
          campaignId,
          amount: 50.00
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/payments/confirm', () => {
    it('should confirm payment with valid payment ID', async () => {
      // First create a payment
      const paymentData = {
        campaignId,
        amount: 50.00,
        description: 'Support for Test Campaign'
      };

      const qrResponse = await request(app)
        .post('/api/payments/qr-code')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      const paymentId = qrResponse.body.data.paymentId;

      // Then confirm the payment
      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ paymentId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        status: 'confirmed',
        amount: paymentData.amount.toString(),
        campaignId: campaignId
      });
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ paymentId: 'non-existent-payment-id' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .post('/api/payments/confirm')
        .send({ paymentId: 'some-payment-id' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payments/status/:paymentId', () => {
    let paymentId: string;

    beforeEach(async () => {
      // Create a payment first
      const paymentData = {
        campaignId,
        amount: 50.00,
        description: 'Support for Test Campaign'
      };

      const qrResponse = await request(app)
        .post('/api/payments/qr-code')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      paymentId = qrResponse.body.data.paymentId;
    });

    it('should return payment status', async () => {
      const response = await request(app)
        .get(`/api/payments/status/${paymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        paymentId,
        status: expect.any(String),
        amount: expect.any(String)
      });
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/status/non-existent-payment-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .get(`/api/payments/status/${paymentId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
