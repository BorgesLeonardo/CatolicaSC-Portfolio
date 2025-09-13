import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middleware/error';
import { AppError } from '../../utils/AppError';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AppError handling', () => {
    it('should handle AppError with status code and message', () => {
      const appError = new AppError('Test error', 400);
      
      errorHandler(appError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Test error',
        message: 'Test error',
        details: undefined
      });
    });

    it('should handle AppError with details', () => {
      const details = { field: 'test', reason: 'invalid' };
      const appError = new AppError('Validation error', 422, details);
      
      errorHandler(appError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        message: 'Validation error',
        details: details
      });
    });

    it('should handle AppError with default status code 500', () => {
      const appError = new AppError('Server error');
      
      errorHandler(appError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Server error',
        message: 'Server error',
        details: undefined
      });
    });
  });

  describe('ZodError handling', () => {
    it('should handle ZodError with validation issues', () => {
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      Object.assign(zodError, {
        issues: [
          { path: ['field'], message: 'Required' },
          { path: ['email'], message: 'Invalid email' }
        ]
      });
      
      errorHandler(zodError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'ValidationError',
        message: 'Dados inválidos',
        details: (zodError as any).issues
      });
    });
  });

  describe('Generic error handling', () => {
    it('should handle generic errors as internal server error', () => {
      const genericError = new Error('Something went wrong');
      
      errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Internal Server Error:', genericError);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'InternalError',
        message: 'Erro interno do servidor'
      });
    });

    it('should handle non-Error objects', () => {
      const nonError = 'String error';
      
      errorHandler(nonError as any, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Internal Server Error:', nonError);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'InternalError',
        message: 'Erro interno do servidor'
      });
    });
  });
});
