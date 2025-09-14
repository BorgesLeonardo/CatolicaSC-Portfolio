import { Request, Response, NextFunction } from 'express';
import { CategoriesController } from '../../../controllers/categories.controller';
import { CategoriesService } from '../../../services/categories.service';
import { AppError } from '../../../utils/AppError';

// Mock do CategoriesService
jest.mock('../../../services/categories.service');

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let mockService: jest.Mocked<CategoriesService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockService = {
      list: jest.fn(),
      getById: jest.fn(),
    } as any;

    controller = new CategoriesController(mockService);
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('list', () => {
    it('should return categories list successfully', async () => {
      const mockCategories = [
        {
          id: 'cat1',
          name: 'Technology',
          description: 'Tech projects',
          color: '#FF5733',
          icon: 'tech-icon',
          projectsCount: 5,
          _count: {
            projects: 5
          }
        }
      ];

      mockService.list.mockResolvedValue(mockCategories);

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.list).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockCategories);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      mockService.list.mockRejectedValue(error);

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return category when found', async () => {
      const mockCategory = {
        id: 'cm12345678901234567890',
        name: 'Technology',
        description: 'Tech projects',
        color: '#FF5733',
        icon: 'tech-icon',
        projectsCount: 5,
        _count: {
          projects: 5
        }
      };

      mockRequest.params = { id: 'cm12345678901234567890' };
      mockService.getById.mockResolvedValue(mockCategory);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.getById).toHaveBeenCalledWith('cm12345678901234567890');
      expect(mockResponse.json).toHaveBeenCalledWith(mockCategory);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw AppError when category not found', async () => {
      mockRequest.params = { id: 'cat1' };
      mockService.getById.mockResolvedValue(null);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should throw AppError for invalid ID format', async () => {
      mockRequest.params = { id: 'invalid-id' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.getById).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockService.getById.mockRejectedValue(error);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should validate ID parameter format', async () => {
      const testCases = [
        { id: 'invalid-id', shouldThrow: true },
        { id: 'cm12345678901234567890', shouldThrow: false },
        { id: '', shouldThrow: true },
        { id: '123', shouldThrow: true },
      ];

      for (const testCase of testCases) {
        mockRequest.params = { id: testCase.id };
        mockService.getById.mockResolvedValue({ 
          id: testCase.id, 
          name: 'Test',
          description: 'Test description',
          color: '#FF5733',
          icon: 'test-icon',
          projectsCount: 0,
          _count: { projects: 0 }
        });

        await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

        if (testCase.shouldThrow) {
          expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
          expect(mockService.getById).not.toHaveBeenCalled();
        } else {
          expect(mockService.getById).toHaveBeenCalledWith(testCase.id);
        }

        jest.clearAllMocks();
      }
    });
  });
});
