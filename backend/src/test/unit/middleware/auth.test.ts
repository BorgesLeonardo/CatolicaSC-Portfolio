import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { requireApiAuth, requireAuth } from '../../../middleware/auth';
import { AppError } from '../../../utils/AppError';

// Mock do Clerk
jest.mock('@clerk/express');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireApiAuth', () => {
    it('should bypass auth in test environment when TEST_BYPASS_AUTH is true', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'test', TEST_BYPASS_AUTH: 'true' };

      (mockRequest.header as jest.Mock).mockImplementation((headerName: string) => {
        if (headerName === 'x-test-user-id') return 'test_user_123';
        if (headerName === 'x-test-user-role') return 'admin';
        return undefined;
      });

      requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).authUserId).toBe('test_user_123');
      expect((mockRequest as any).authRole).toBe('admin');
      expect(mockNext).toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should not bypass auth when x-test-auth-bypass is false', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'test', TEST_BYPASS_AUTH: 'true' };

      (mockRequest.header as jest.Mock).mockImplementation((headerName: string) => {
        if (headerName === 'x-test-auth-bypass') return 'false';
        return undefined;
      });

      (getAuth as jest.Mock).mockReturnValue({ userId: 'real_user_123' });

      requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).authUserId).toBe('real_user_123');
      expect(mockNext).toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should use default test user when no test headers provided', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'test', TEST_BYPASS_AUTH: 'true' };

      (mockRequest.header as jest.Mock).mockReturnValue(undefined);

      requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).authUserId).toBe('user_test_id');
      expect((mockRequest as any).authRole).toBe('user');
      expect(mockNext).toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should authenticate with Clerk when not in test environment', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'production' };

      (getAuth as jest.Mock).mockReturnValue({ userId: 'real_user_123' });

      requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).authUserId).toBe('real_user_123');
      expect(mockNext).toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should throw AppError when Clerk returns no userId', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'production' };

      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      expect(() => {
        requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(new AppError('Unauthorized', 401));

      process.env = originalEnv;
    });

    it('should throw AppError when Clerk throws an error', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'production' };

      (getAuth as jest.Mock).mockImplementation(() => {
        throw new Error('Clerk error');
      });

      expect(() => {
        requireApiAuth(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(new AppError('Unauthorized', 401));

      process.env = originalEnv;
    });
  });

  describe('requireAuth', () => {
    it('should bypass auth in test environment when TEST_BYPASS_AUTH is true', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'test', TEST_BYPASS_AUTH: 'true' };

      (mockRequest.header as jest.Mock).mockImplementation((headerName: string) => {
        if (headerName === 'x-test-user-id') return 'test_user_123';
        if (headerName === 'x-test-user-role') return 'admin';
        return undefined;
      });

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).authUserId).toBe('test_user_123');
      expect((mockRequest as any).authRole).toBe('admin');
      expect(mockNext).toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should not bypass auth when x-test-auth-bypass is false', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'test', TEST_BYPASS_AUTH: 'true' };

      (mockRequest.header as jest.Mock).mockImplementation((headerName: string) => {
        if (headerName === 'x-test-auth-bypass') return 'false';
        return undefined;
      });

      (getAuth as jest.Mock).mockReturnValue({ userId: 'real_user_123' });

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).authUserId).toBe('real_user_123');
      expect(mockNext).toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should use default test user when no test headers provided', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'test', TEST_BYPASS_AUTH: 'true' };

      (mockRequest.header as jest.Mock).mockReturnValue(undefined);

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).authUserId).toBe('user_test_id');
      expect((mockRequest as any).authRole).toBe('user');
      expect(mockNext).toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should authenticate with Clerk when not in test environment', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'production' };

      (getAuth as jest.Mock).mockReturnValue({ userId: 'real_user_123' });

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).authUserId).toBe('real_user_123');
      expect(mockNext).toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should throw AppError when Clerk returns no userId', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'production' };

      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      expect(() => {
        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(new AppError('Unauthorized', 401));

      process.env = originalEnv;
    });

    it('should throw AppError when Clerk throws an error', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'production' };

      (getAuth as jest.Mock).mockImplementation(() => {
        throw new Error('Clerk error');
      });

      expect(() => {
        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(new AppError('Unauthorized', 401));

      process.env = originalEnv;
    });
  });
});
