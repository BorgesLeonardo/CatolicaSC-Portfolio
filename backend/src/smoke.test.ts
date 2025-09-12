import request from 'supertest';
import app from './app';

describe('Smoke Tests', () => {
  describe('Health Check', () => {
    it('should return 200 for health endpoint', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toEqual({ ok: true });
    });
  });

  describe('Projects API', () => {
    it('should return 200 for projects list (public)', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);
      
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should return 401 for protected routes without auth', async () => {
      await request(app)
        .post('/api/projects')
        .send({
          title: 'Test Project',
          goalCents: 10000,
          deadline: new Date().toISOString()
        })
        .expect(401);
    });
  });

  describe('Stripe Integration', () => {
    it('should return 400 for checkout without auth (missing fields)', async () => {
      await request(app)
        .post('/api/contributions/checkout')
        .send({
          projectId: 'test-id',
          amount: 1000,
          currency: 'brl',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
        .expect(400);
    });
  });
});
