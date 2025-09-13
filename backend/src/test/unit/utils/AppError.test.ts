import { AppError, createError } from '../../utils/AppError';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.details).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error with message, status code and details', () => {
      const details = { field: 'test' };
      const error = new AppError('Test error', 422, details);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(422);
      expect(error.details).toEqual(details);
    });

    it('should use default status code 500 when not provided', () => {
      const error = new AppError('Test error');
      
      expect(error.statusCode).toBe(500);
    });

    it('should maintain correct stack trace', () => {
      const error = new AppError('Test error', 400);
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('createError helper', () => {
    it('should create AppError instance', () => {
      const error = createError('Test error', 400);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
    });

    it('should use default status code 500', () => {
      const error = createError('Test error');
      
      expect(error.statusCode).toBe(500);
    });

    it('should pass details correctly', () => {
      const details = { validation: 'failed' };
      const error = createError('Test error', 422, details);
      
      expect(error.details).toEqual(details);
    });
  });
});
