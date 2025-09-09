import request from 'supertest'
import { app } from '@/app/app'

describe('App Configuration', () => {
  describe('Health Check Endpoint', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'OK')
      expect(response.body).toHaveProperty('timestamp')
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date)
    })
  })

  describe('API Routes', () => {
    it('should return development message for /api', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200)

      expect(response.body).toHaveProperty('message', 'API em desenvolvimento')
    })

    it('should return development message for /api with any method', async () => {
      const response = await request(app)
        .post('/api')
        .expect(200)

      expect(response.body).toHaveProperty('message', 'API em desenvolvimento')
    })
  })

  describe('Security Middlewares', () => {
    it('should include security headers from helmet', async () => {
      const response = await request(app)
        .get('/health')

      // Check for common helmet headers
      expect(response.headers).toHaveProperty('x-content-type-options')
      expect(response.headers).toHaveProperty('x-frame-options')
    })

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')

      // CORS headers should be present
      expect(response.headers).toHaveProperty('access-control-allow-origin')
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      // Make a few requests to test rate limiting
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get('/health')
          .expect(200)
      }
    })
  })

  describe('JSON Parsing', () => {
    it('should parse JSON requests', async () => {
      const testData = { test: 'data', number: 123 }
      
      const response = await request(app)
        .post('/api')
        .send(testData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'API em desenvolvimento')
    })
  })
})
