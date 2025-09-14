import { AppError } from '../utils/AppError';

describe('Import Test', () => {
  it('should import AppError successfully', () => {
    const error = new AppError('Test error', 400);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
  });
});
