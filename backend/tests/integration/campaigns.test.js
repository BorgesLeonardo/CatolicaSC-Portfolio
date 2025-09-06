const request = require('supertest');
const app = require('../../src/server');
const database = require('../../src/config/database');

describe('Campaigns Integration Tests', () => {
  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  describe('GET /api/campaigns', () => {
    it('should return campaigns list', async () => {
      const response = await request(app)
        .get('/api/campaigns')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/campaigns?page=1&limit=5')
        .expect(200);

      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 5);
    });

    it('should support search', async () => {
      const response = await request(app)
        .get('/api/campaigns?search=test')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/campaigns/:id', () => {
    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/api/campaigns/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Campanha não encontrada');
    });
  });
});
