import request from 'supertest';
import app from '../../app';

describe('Health Check Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({ ok: true });
    });
  });

  describe('GET /health', () => {
    it('should return health status on alternative endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ ok: true });
    });
  });
});
