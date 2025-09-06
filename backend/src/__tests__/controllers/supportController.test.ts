import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Support Controller', () => {
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
    await prisma.comment.deleteMany();
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

  describe('POST /api/supports', () => {
    it('should create a new support with valid data', async () => {
      const supportData = {
        campaignId,
        amount: 50.00,
        message: 'Great cause!',
        isAnonymous: false
      };

      const response = await request(app)
        .post('/api/supports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(supportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        amount: supportData.amount.toString(),
        message: supportData.message,
        isAnonymous: supportData.isAnonymous
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/supports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('required');
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .post('/api/supports')
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
        .post('/api/supports')
        .send({
          campaignId,
          amount: 50.00
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/supports/campaign/:campaignId', () => {
    beforeEach(async () => {
      // Create test supports
      await prisma.support.create({
        data: {
          campaignId,
          userId,
          amount: 50,
          message: 'First support'
        }
      });

      await prisma.support.create({
        data: {
          campaignId,
          userId,
          amount: 100,
          message: 'Second support'
        }
      });
    });

    it('should return all supports for a campaign', async () => {
      const response = await request(app)
        .get(`/api/supports/campaign/${campaignId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        amount: expect.any(String),
        message: expect.any(String),
        createdAt: expect.any(String)
      });
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/api/supports/campaign/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/supports/user', () => {
    beforeEach(async () => {
      // Create test supports
      await prisma.support.create({
        data: {
          campaignId,
          userId,
          amount: 50,
          message: 'User support 1'
        }
      });

      await prisma.support.create({
        data: {
          campaignId,
          userId,
          amount: 75,
          message: 'User support 2'
        }
      });
    });

    it('should return all supports by the authenticated user', async () => {
      const response = await request(app)
        .get('/api/supports/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .get('/api/supports/user')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
