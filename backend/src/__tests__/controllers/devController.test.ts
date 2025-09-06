import { Request, Response } from 'express';
import { getDevStatus } from '../../controllers/devController';

// Mock the response object
const mockResponse = {
  success: jest.fn(),
} as any;

const mockRequest = {} as Request;

describe('DevController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDevStatus', () => {
    it('should call res.success with correct data', () => {
      getDevStatus(mockRequest, mockResponse);

      expect(mockResponse.success).toHaveBeenCalledWith({
        status: 'ok',
      });
    });

    it('should call res.success only once', () => {
      getDevStatus(mockRequest, mockResponse);

      expect(mockResponse.success).toHaveBeenCalledTimes(1);
    });
  });
});
