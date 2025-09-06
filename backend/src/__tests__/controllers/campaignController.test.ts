import request from 'supertest';
import app from '../../app';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    campaign: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    support: {
      deleteMany: jest.fn()
    },
    comment: {
      deleteMany: jest.fn()
    },
    $disconnect: jest.fn()
  }))
}));

// Mock Clerk
jest.mock('@clerk/clerk-sdk-node', () => ({
  verifyToken: jest.fn().mockResolvedValue({
    sub: 'test-user-id',
    sid: 'test-session-id'
  })
}));

describe('Campaign Controller', () => {
  const authToken = 'mock-jwt-token';

  describe('POST /api/campaigns', () => {
    it('should create a new campaign with valid data', async () => {
      const campaignData = {
        title: 'Test Campaign',
        description: 'This is a test campaign',
        goal: 1000.00,
        deadline: '2024-12-31T23:59:59Z',
        imageUrl: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(campaignData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: campaignData.title,
        description: campaignData.description,
        goal: campaignData.goal.toString(),
        current: '0',
        imageUrl: campaignData.imageUrl,
        isActive: true
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('required');
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .send({
          title: 'Test Campaign',
          description: 'This is a test campaign',
          goal: 1000.00,
          deadline: '2024-12-31T23:59:59Z'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/campaigns', () => {
    it('should return all active campaigns', async () => {
      const response = await request(app)
        .get('/api/campaigns')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/campaigns?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 1
      });
    });
  });

  describe('GET /api/campaigns/:id', () => {
    it('should return campaign details', async () => {
      const response = await request(app)
        .get('/api/campaigns/test-campaign-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: 'test-campaign-id',
        title: expect.any(String),
        description: expect.any(String),
        goal: expect.any(String),
        current: expect.any(String),
        isActive: true
      });
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/api/campaigns/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/campaigns/:id', () => {
    it('should update campaign with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        goal: 1500
      };

      const response = await request(app)
        .put('/api/campaigns/test-campaign-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(updateData);
    });

    it('should return 403 for non-author trying to update', async () => {
      const response = await request(app)
        .put('/api/campaigns/test-campaign-id')
        .set('Authorization', `Bearer different-user-token`)
        .send({ title: 'Hacked Title' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/campaigns/:id', () => {
    it('should delete campaign', async () => {
      const response = await request(app)
        .delete('/api/campaigns/test-campaign-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 for non-author trying to delete', async () => {
      const response = await request(app)
        .delete('/api/campaigns/test-campaign-id')
        .set('Authorization', `Bearer different-user-token`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});