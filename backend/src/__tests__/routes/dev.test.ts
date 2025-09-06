import request from 'supertest';
import app from '../../app';

describe('GET /dev', () => {
  it('should return status 200 with success message', async () => {
    const response = await request(app).get('/dev');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        status: 'ok',
      },
    });
  });

  it('should have correct content type', async () => {
    const response = await request(app).get('/dev');

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should respond quickly', async () => {
    const start = Date.now();
    await request(app).get('/dev');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // Should respond in less than 1 second
  });
});
