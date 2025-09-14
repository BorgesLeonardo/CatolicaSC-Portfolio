import { Request, Response, NextFunction } from 'express';
import { ContributionsController } from '../../../controllers/contributions.controller';
import { ContributionsService } from '../../../services/contributions.service';
import { AppError } from '../../../utils/AppError';

// Mock do ContributionsService
jest.mock('../../../services/contributions.service');

describe('ContributionsController', () => {
  let controller: ContributionsController;
  let mockService: jest.Mocked<ContributionsService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockService = {
      createCheckout: jest.fn(),
      listByProject: jest.fn(),
      hasContributions: jest.fn(),
    } as any;

    controller = new ContributionsController(mockService);
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('createCheckout', () => {
    const validCheckoutData = {
      projectId: 'cm12345678901234567890',
      amountCents: 5000,
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    };

    it('should create checkout successfully', async () => {
      const mockResult = { 
        checkoutUrl: 'https://checkout.stripe.com/test',
        contributionId: 'contrib123'
      };
      mockRequest.body = validCheckoutData;
      (mockRequest as any).authUserId = 'user123';
      mockService.createCheckout.mockResolvedValue(mockResult);

      await controller.createCheckout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.createCheckout).toHaveBeenCalledWith(validCheckoutData, 'user123');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should create checkout without optional URLs', async () => {
      const checkoutDataWithoutUrls = {
        projectId: 'cm12345678901234567890',
        amountCents: 5000,
      };
      const mockResult = { 
        checkoutUrl: 'https://checkout.stripe.com/test',
        contributionId: 'contrib123'
      };
      mockRequest.body = checkoutDataWithoutUrls;
      (mockRequest as any).authUserId = 'user123';
      mockService.createCheckout.mockResolvedValue(mockResult);

      await controller.createCheckout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.createCheckout).toHaveBeenCalledWith(checkoutDataWithoutUrls, 'user123');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should throw AppError for invalid projectId', async () => {
      mockRequest.body = { ...validCheckoutData, projectId: 'invalid-id' };

      await controller.createCheckout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.createCheckout).not.toHaveBeenCalled();
    });

    it('should throw AppError for invalid amountCents', async () => {
      mockRequest.body = { ...validCheckoutData, amountCents: 50 }; // Below minimum

      await controller.createCheckout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.createCheckout).not.toHaveBeenCalled();
    });

    it('should throw AppError for invalid successUrl', async () => {
      mockRequest.body = { ...validCheckoutData, successUrl: 'not-a-url' };

      await controller.createCheckout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.createCheckout).not.toHaveBeenCalled();
    });

    it('should throw AppError for invalid cancelUrl', async () => {
      mockRequest.body = { ...validCheckoutData, cancelUrl: 'not-a-url' };

      await controller.createCheckout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.createCheckout).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      mockRequest.body = validCheckoutData;
      (mockRequest as any).authUserId = 'user123';
      mockService.createCheckout.mockRejectedValue(error);

      await controller.createCheckout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listByProject', () => {
    it('should list contributions by project with default pagination', async () => {
      const mockResult = { items: [], total: 0, page: 1, pageSize: 10 };
      mockRequest.params = { projectId: 'cm12345678901234567890' };
      mockRequest.query = {};
      mockService.listByProject.mockResolvedValue(mockResult);

      await controller.listByProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.listByProject).toHaveBeenCalledWith('cm12345678901234567890', 1, 10);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should list contributions with custom pagination', async () => {
      const mockResult = { items: [], total: 0, page: 2, pageSize: 20 };
      mockRequest.params = { projectId: 'cm12345678901234567890' };
      mockRequest.query = { page: '2', pageSize: '20' };
      mockService.listByProject.mockResolvedValue(mockResult);

      await controller.listByProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.listByProject).toHaveBeenCalledWith('cm12345678901234567890', 2, 20);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should throw AppError when projectId is missing', async () => {
      mockRequest.params = {};
      mockRequest.query = {};

      await controller.listByProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.listByProject).not.toHaveBeenCalled();
    });

    it('should clamp page and pageSize values', async () => {
      const mockResult = { items: [], total: 0, page: 1, pageSize: 10 };
      mockRequest.params = { projectId: 'cm12345678901234567890' };
      mockRequest.query = { page: '-1', pageSize: '100' };
      mockService.listByProject.mockResolvedValue(mockResult);

      await controller.listByProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.listByProject).toHaveBeenCalledWith('cm12345678901234567890', 1, 50);
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      mockRequest.params = { projectId: 'cm12345678901234567890' };
      mockRequest.query = {};
      mockService.listByProject.mockRejectedValue(error);

      await controller.listByProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('hasContributions', () => {
    it('should return hasContributions status', async () => {
      const mockResult = { hasContributions: true };
      mockRequest.params = { projectId: 'cm12345678901234567890' };
      mockService.hasContributions.mockResolvedValue(true);

      await controller.hasContributions(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.hasContributions).toHaveBeenCalledWith('cm12345678901234567890');
      expect(mockResponse.json).toHaveBeenCalledWith({ hasContributions: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return false when no contributions', async () => {
      mockRequest.params = { projectId: 'cm12345678901234567890' };
      mockService.hasContributions.mockResolvedValue(false);

      await controller.hasContributions(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.hasContributions).toHaveBeenCalledWith('cm12345678901234567890');
      expect(mockResponse.json).toHaveBeenCalledWith({ hasContributions: false });
    });

    it('should throw AppError when projectId is missing', async () => {
      mockRequest.params = {};

      await controller.hasContributions(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.hasContributions).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      mockRequest.params = { projectId: 'cm12345678901234567890' };
      mockService.hasContributions.mockRejectedValue(error);

      await controller.hasContributions(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
