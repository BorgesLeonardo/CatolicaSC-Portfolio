import request from 'supertest';
import { Express } from 'express';
import { testPrisma, cleanupTestDatabase, seedTestDatabase } from '../../config/testDatabase';
import { createApp } from '../../app';

describe('Campaign Controller Integration Tests', () => {
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

  describe('GET /api/campaigns', () => {
    it('should return all campaigns', async () => {
      const response = await request(app)
        .get('/api/campaigns')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Test Campaign 1');
    });

    it('should filter campaigns by category', async () => {
      const response = await request(app)
        .get('/api/campaigns?categoryId=' + testData.categories[0].id)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should search campaigns by title', async () => {
      const response = await request(app)
        .get('/api/campaigns?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/campaigns/:id', () => {
    it('should return a specific campaign', async () => {
      const campaign = testData.campaigns[0];
      const response = await request(app)
        .get(`/api/campaigns/${campaign.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(campaign.id);
      expect(response.body.data.title).toBe(campaign.title);
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/api/campaigns/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/campaigns', () => {
    it('should create a new campaign with valid data', async () => {
      const newCampaign = {
        title: 'New Test Campaign',
        description: 'New test campaign description',
        goal: 2000.00,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        categoryId: testData.categories[0].id,
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', 'Bearer test-token')
        .send(newCampaign)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newCampaign.title);
      expect(response.body.data.goal).toBe(newCampaign.goal.toString());
    });

    it('should return 400 for invalid data', async () => {
      const invalidCampaign = {
        title: '',
        description: 'Test description',
        goal: -100,
        deadline: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', 'Bearer test-token')
        .send(invalidCampaign)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/campaigns/:id', () => {
    it('should update a campaign', async () => {
      const campaign = testData.campaigns[0];
      const updateData = {
        title: 'Updated Campaign Title',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/campaigns/${campaign.id}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should return 404 for non-existent campaign', async () => {
      const updateData = {
        title: 'Updated Title',
      };

      const response = await request(app)
        .put('/api/campaigns/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/campaigns/:id', () => {
    it('should delete a campaign', async () => {
      const campaign = testData.campaigns[0];

      const response = await request(app)
        .delete(`/api/campaigns/${campaign.id}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify campaign is deleted
      const deletedCampaign = await testPrisma.campaign.findUnique({
        where: { id: campaign.id }
      });
      expect(deletedCampaign).toBeNull();
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .delete('/api/campaigns/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
