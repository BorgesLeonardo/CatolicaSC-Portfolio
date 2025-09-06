import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('User Controller', () => {
  let authToken: string;
  let userId: string;

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
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        clerkId: 'clerk-test-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        imageUrl: 'https://example.com/avatar.jpg'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        clerkId: userData.clerkId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        imageUrl: userData.imageUrl
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('required');
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          clerkId: 'clerk-test-id',
          email: 'test@example.com'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/profile', () => {
    beforeEach(async () => {
      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          clerkId: 'clerk-test-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        }
      });
    });

    it('should return user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      });
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/dashboard', () => {
    beforeEach(async () => {
      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          clerkId: 'clerk-test-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        }
      });

      // Create test campaigns
      await prisma.campaign.create({
        data: {
          title: 'Campaign 1',
          description: 'Description 1',
          goal: 1000,
          deadline: new Date('2024-12-31'),
          authorId: userId
        }
      });

      await prisma.campaign.create({
        data: {
          title: 'Campaign 2',
          description: 'Description 2',
          goal: 2000,
          deadline: new Date('2024-12-31'),
          authorId: userId
        }
      });

      // Create test supports
      await prisma.support.create({
        data: {
          campaignId: 'campaign-1',
          userId,
          amount: 100
        }
      });
    });

    it('should return user dashboard data', async () => {
      const response = await request(app)
        .get('/api/users/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        user: expect.objectContaining({
          id: userId,
          email: 'test@example.com'
        }),
        campaigns: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            goal: expect.any(String)
          })
        ]),
        supports: expect.arrayContaining([
          expect.objectContaining({
            amount: expect.any(String)
          })
        ]),
        stats: expect.objectContaining({
          totalCampaigns: expect.any(Number),
          totalSupports: expect.any(Number),
          totalRaised: expect.any(String)
        })
      });
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .get('/api/users/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    beforeEach(async () => {
      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          clerkId: 'clerk-test-id',
          email: 'test@example.com',
          firstName: 'Original',
          lastName: 'Name'
        }
      });
    });

    it('should update user profile with valid data', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        imageUrl: 'https://example.com/new-avatar.jpg'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(updateData);
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({ firstName: 'Hacked' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
