import { Request, Response } from 'express';
import { HealthController } from '../../../controllers/health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new HealthController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('alive', () => {
    it('should return ok: true', async () => {
      await controller.alive(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.json).toHaveBeenCalledWith({ ok: true });
    });

    it('should be async and return a promise', () => {
      const result = controller.alive(mockRequest as Request, mockResponse as Response);
      
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
