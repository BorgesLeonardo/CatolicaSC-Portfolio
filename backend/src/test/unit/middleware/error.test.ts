import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../middleware/error';
import { AppError } from '../../../utils/AppError';

describe('errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('AppError handling', () => {
    it('should handle AppError with status code and message', () => {
      const appError = new AppError('User not found', 404);
      
      errorHandler(appError, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
        message: 'User not found',
        details: undefined,
      });
    });

    it('should handle AppError with details', () => {
      const details = { field: 'email', message: 'Invalid format' };
      const appError = new AppError('Validation error', 400, details);
      
      errorHandler(appError, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        message: 'Validation error',
        details: details,
      });
    });
  });

  describe('ZodError handling', () => {
    it('should handle ZodError with validation issues', () => {
      const zodError = new Error('Validation error');
      zodError.name = 'ZodError';
      (zodError as any).issues = [
        { path: ['email'], message: 'Invalid email format' }
      ];
      
      errorHandler(zodError, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'ValidationError',
        message: 'Dados inválidos',
        details: (zodError as any).issues,
      });
    });
  });

  describe('Generic error handling', () => {
    it('should handle generic errors with 500 status', () => {
      const genericError = new Error('Something went wrong');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(consoleSpy).toHaveBeenCalledWith('Internal Server Error:', genericError);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'InternalError',
        message: 'Erro interno do servidor',
      }));
      
      consoleSpy.mockRestore();
    });

    it('should handle errors without message', () => {
      const errorWithoutMessage = new Error();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      errorHandler(errorWithoutMessage, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(consoleSpy).toHaveBeenCalledWith('Internal Server Error:', errorWithoutMessage);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'InternalError',
        message: 'Erro interno do servidor',
      }));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Prisma unique constraint (P2002)', () => {
    it('should return 409 Conflict with target details', () => {
      const prismaError: any = new Error('Unique constraint failed')
      prismaError.code = 'P2002'
      prismaError.meta = { target: ['slug'] }

      errorHandler(prismaError, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(409)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Conflict',
        message: 'Registro já existe com os mesmos dados únicos',
        details: { target: ['slug'] },
      })
    })
  })
});
