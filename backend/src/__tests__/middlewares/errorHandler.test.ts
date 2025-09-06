import { Request, Response } from 'express';
import {
  errorHandler,
  notFoundHandler,
  createError,
} from '../../middlewares/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('errorHandler', () => {
    it('should handle error with status code', () => {
      const error = new Error('Test error') as unknown as {
        statusCode: number;
        message: string;
        name: string;
      };
      error.statusCode = 400;
      error.name = 'Error';

      errorHandler(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Test error',
        },
      });
    });

    it('should handle error without status code (default 500)', () => {
      const error = new Error('Test error');

      errorHandler(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal Server Error',
        },
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 for unknown routes', () => {
      mockRequest = { originalUrl: '/unknown-route' };

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Route /unknown-route not found',
        },
      });
    });
  });

  describe('createError', () => {
    it('should create error with custom message and status code', () => {
      const error = createError('Custom error', 422);

      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(422);
      expect(error.isOperational).toBe(true);
    });

    it('should create error with default status code 500', () => {
      const error = createError('Default error');

      expect(error.message).toBe('Default error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });
  });
});
