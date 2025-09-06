import request from 'supertest';
import { Express } from 'express';
import { testPrisma, cleanupTestDatabase, seedTestDatabase } from '../../config/testDatabase';
import { createApp } from '../../app';

describe('User Controller Integration Tests', () => {
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

  describe('GET /api/users/profile', () => {
    it('should return user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clerkId).toBe('test_user_1');
      expect(response.body.data.email).toBe('test1@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      // Mock a non-existent user
      jest.spyOn(require('../../middlewares/auth'), 'authMiddleware')
        .mockImplementation((req: any, res: any, next: any) => {
          req.auth = { userId: 'non-existent-user' };
          next();
        });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer test-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated First Name',
        lastName: 'Updated Last Name',
        imageUrl: 'https://example.com/new-image.jpg',
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.imageUrl).toBe(updateData.imageUrl);

      // Verify in database
      const updatedUser = await testPrisma.user.findUnique({
        where: { clerkId: 'test_user_1' }
      });
      expect(updatedUser?.firstName).toBe(updateData.firstName);
      expect(updatedUser?.lastName).toBe(updateData.lastName);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        firstName: '', // Empty string
        email: 'invalid-email', // Invalid email format
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer test-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      const user = testData.users[0];
      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.email).toBe(user.email);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id/campaigns', () => {
    it('should return user campaigns', async () => {
      const user = testData.users[0];
      const response = await request(app)
        .get(`/api/users/${user.id}/campaigns`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].authorId).toBe(user.id);
    });

    it('should return empty array for user with no campaigns', async () => {
      const user = testData.users[1]; // User 2 has no campaigns
      const response = await request(app)
        .get(`/api/users/${user.id}/campaigns`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/users/:id/supports', () => {
    it('should return user supports', async () => {
      const user = testData.users[0];
      const campaign = testData.campaigns[0];

      // Create a support first
      await testPrisma.support.create({
        data: {
          campaignId: campaign.id,
          userId: user.id,
          amount: 50.00,
          message: 'Test support',
          isAnonymous: false,
        },
      });

      const response = await request(app)
        .get(`/api/users/${user.id}/supports`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].userId).toBe(user.id);
    });

    it('should return empty array for user with no supports', async () => {
      const user = testData.users[1]; // User 2 has no supports
      const response = await request(app)
        .get(`/api/users/${user.id}/supports`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });
});
