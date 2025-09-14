import { AppError, createError } from '../../../utils/AppError';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create an AppError with default status code 500', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.details).toBeUndefined();
      expect(error instanceof Error).toBe(true);
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError('Not found', 404);
      
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.details).toBeUndefined();
    });

    it('should create an AppError with details', () => {
      const details = { field: 'email', message: 'Invalid email format' };
      const error = new AppError('Validation error', 400, details);
      
      expect(error.message).toBe('Validation error');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
    });

    it('should maintain correct stack trace', () => {
      const error = new AppError('Test error');
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('createError', () => {
    it('should create an AppError with default status code 500', () => {
      const error = createError('Test error');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
    });

    it('should create an AppError with custom status code', () => {
      const error = createError('Bad request', 400);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Bad request');
      expect(error.statusCode).toBe(400);
    });

    it('should create an AppError with details', () => {
      const details = { code: 'VALIDATION_ERROR' };
      const error = createError('Validation failed', 422, details);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(422);
      expect(error.details).toEqual(details);
    });
  });
});
