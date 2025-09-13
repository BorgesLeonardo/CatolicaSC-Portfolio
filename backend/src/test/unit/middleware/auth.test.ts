import { Request, Response, NextFunction } from 'express';
import { requireApiAuth, requireAuth } from '../../middleware/auth';
import { AppError } from '../../utils/AppError';

// Mock do Clerk
jest.mock('@clerk/express', () => ({
  getAuth: jest.fn()
}));

import { getAuth } from '@clerk/express';
const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
      headers: {}
    };
    mockResponse = {};
    mockNext = jest.fn();
    
    // Reset environment
    process.env.NODE_ENV = 'test';
    process.env.TEST_BYPASS_AUTH = 'true';
    
    jest.clearAllMocks();
  });

  describe('requireApiAuth', () => {
    it('should bypass auth in test environment when TEST_BYPASS_AUTH is true', () => {
      mockRequest.header = jest.fn()
        .mockReturnValueOnce('true') // x-test-auth-bypass
        .mockReturnValueOnce('test-user-123'); // x-test-user-id

      requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).authUserId).toBe('test-user-123');
    });

    it('should not bypass auth when x-test-auth-bypass is false', () => {
      mockRequest.header = jest.fn()
        .mockReturnValueOnce('false') // x-test-auth-bypass
        .mockReturnValueOnce('test-user-123'); // x-test-user-id

      mockGetAuth.mockReturnValue({ userId: 'clerk-user-123' } as any);

      requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).authUserId).toBe('clerk-user-123');
    });

    it('should use default test user when no x-test-user-id provided', () => {
      mockRequest.header = jest.fn()
        .mockReturnValueOnce('true') // x-test-auth-bypass
        .mockReturnValueOnce(undefined); // x-test-user-id

      requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).authUserId).toBe('user_test_id');
    });

    it('should use Clerk auth in production environment', () => {
      process.env.NODE_ENV = 'production';
      mockGetAuth.mockReturnValue({ userId: 'clerk-user-123' } as any);

      requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).authUserId).toBe('clerk-user-123');
    });

    it('should throw AppError when Clerk auth fails', () => {
      process.env.NODE_ENV = 'production';
      mockGetAuth.mockImplementation(() => {
        throw new Error('Auth failed');
      });

      expect(() => {
        requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(AppError);
    });

    it('should throw AppError when no userId from Clerk', () => {
      process.env.NODE_ENV = 'production';
      mockGetAuth.mockReturnValue({ userId: null } as any);

      expect(() => {
        requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(AppError);
    });
  });

  describe('requireAuth', () => {
    it('should work identically to requireApiAuth', () => {
      mockRequest.header = jest.fn()
        .mockReturnValueOnce('true') // x-test-auth-bypass
        .mockReturnValueOnce('test-user-456'); // x-test-user-id

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).authUserId).toBe('test-user-456');
    });

    it('should handle role from test headers', () => {
      mockRequest.header = jest.fn()
        .mockReturnValueOnce('true') // x-test-auth-bypass
        .mockReturnValueOnce('test-user-789') // x-test-user-id
        .mockReturnValueOnce('admin'); // x-test-user-role

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).authUserId).toBe('test-user-789');
      expect((mockRequest as any).authRole).toBe('admin');
    });
  });
});
