import { Request, Response, NextFunction } from 'express';
import { CategoriesController } from '../../controllers/categories.controller';
import { CategoriesService } from '../../services/categories.service';
import { AppError } from '../../utils/AppError';

// Mock do service
jest.mock('../../services/categories.service');

const MockedCategoriesService = CategoriesService as jest.MockedClass<typeof CategoriesService>;

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let mockService: jest.Mocked<CategoriesService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockService = {
      list: jest.fn(),
      getById: jest.fn()
    } as any;

    controller = new CategoriesController(mockService);
    
    mockRequest = {
      params: {}
    };
    mockResponse = {
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list all categories successfully', async () => {
      const mockCategories = [
        {
          id: 'cat1',
          name: 'Technology',
          description: 'Tech projects',
          color: '#FF0000',
          icon: 'tech-icon',
          projectsCount: 5
        },
        {
          id: 'cat2',
          name: 'Art',
          description: 'Art projects',
          color: '#00FF00',
          icon: 'art-icon',
          projectsCount: 3
        }
      ];

      mockService.list.mockResolvedValue(mockCategories as any);

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.list).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockCategories);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('Database error', 500);
      mockService.list.mockRejectedValue(serviceError);

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });

    it('should return empty array when no categories found', async () => {
      mockService.list.mockResolvedValue([]);

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });
  });

  describe('getById', () => {
    it('should get category by id successfully', async () => {
      const mockCategory = {
        id: 'cat1',
        name: 'Technology',
        description: 'Tech projects',
        color: '#FF0000',
        icon: 'tech-icon',
        projectsCount: 5
      };

      mockService.getById.mockResolvedValue(mockCategory as any);
      mockRequest.params = { id: 'cat1' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.getById).toHaveBeenCalledWith('cat1');
      expect(mockResponse.json).toHaveBeenCalledWith(mockCategory);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle invalid id format', async () => {
      mockRequest.params = { id: 'invalid-id' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext.mock.calls[0][0] as AppError).statusCode).toBe(400);
      expect((mockNext.mock.calls[0][0] as AppError).message).toBe('ValidationError');
    });

    it('should handle category not found', async () => {
      mockService.getById.mockResolvedValue(null);
      mockRequest.params = { id: 'cat1' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext.mock.calls[0][0] as AppError).statusCode).toBe(404);
      expect((mockNext.mock.calls[0][0] as AppError).message).toBe('Category not found');
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('Database error', 500);
      mockService.getById.mockRejectedValue(serviceError);
      mockRequest.params = { id: 'cat1' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });
});
