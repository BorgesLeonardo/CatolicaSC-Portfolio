import { Request, Response } from 'express';
import { HealthController } from '../../controllers/health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new HealthController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis()
    };
  });

  describe('alive', () => {
    it('should return health status', async () => {
      await controller.alive(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({ ok: true });
    });
  });
});
