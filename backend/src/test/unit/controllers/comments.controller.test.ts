import { Request, Response, NextFunction } from 'express';
import { CommentsController } from '../../../controllers/comments.controller';
import { CommentsService } from '../../../services/comments.service';
import { AppError } from '../../../utils/AppError';

// Mock do CommentsService
jest.mock('../../../services/comments.service');

describe('CommentsController', () => {
  let controller: CommentsController;
  let mockService: jest.Mocked<CommentsService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockService = {
      create: jest.fn(),
      listByProject: jest.fn(),
      delete: jest.fn(),
    } as any;

    controller = new CommentsController(mockService);
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('create', () => {
    const validCommentData = {
      content: 'This is a test comment'
    };

    it('should create comment successfully', async () => {
      const mockComment = { 
        id: 'comment1', 
        content: 'This is a test comment', 
        projectId: 'proj1',
        authorId: 'user123',
        author: {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockRequest.body = validCommentData;
      (mockRequest as any).authUserId = 'user123';
      mockService.create.mockResolvedValue(mockComment);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.create).toHaveBeenCalledWith('cm12345678901234567890', validCommentData, 'user123');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockComment);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw AppError for invalid project ID', async () => {
      mockRequest.params = { id: 'invalid-id' };
      mockRequest.body = validCommentData;

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should throw AppError for empty content', async () => {
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockRequest.body = { content: '' };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should throw AppError for content too long', async () => {
      const longContent = 'a'.repeat(5001); // Exceeds 5000 character limit
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockRequest.body = { content: longContent };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockRequest.body = validCommentData;
      (mockRequest as any).authUserId = 'user123';
      mockService.create.mockRejectedValue(error);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listByProject', () => {
    it('should list comments by project with default pagination', async () => {
      const mockResult = { items: [], total: 0, page: 1, pageSize: 10 };
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockRequest.query = {};
      mockService.listByProject.mockResolvedValue(mockResult);

      await controller.listByProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.listByProject).toHaveBeenCalledWith('cm12345678901234567890', 1, 10);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should list comments with custom pagination', async () => {
      const mockResult = { items: [], total: 0, page: 2, pageSize: 20 };
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockRequest.query = { page: '2', pageSize: '20' };
      mockService.listByProject.mockResolvedValue(mockResult);

      await controller.listByProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.listByProject).toHaveBeenCalledWith('cm12345678901234567890', 2, 20);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should throw AppError for invalid project ID', async () => {
      mockRequest.params = { id: 'invalid-id' };
      mockRequest.query = {};

      await controller.listByProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.listByProject).not.toHaveBeenCalled();
    });

    it('should clamp page and pageSize values', async () => {
      const mockResult = { items: [], total: 0, page: 1, pageSize: 10 };
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockRequest.query = { page: '-1', pageSize: '100' };
      mockService.listByProject.mockResolvedValue(mockResult);

      await controller.listByProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.listByProject).toHaveBeenCalledWith('cm12345678901234567890', 1, 50);
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockRequest.query = {};
      mockService.listByProject.mockRejectedValue(error);

      await controller.listByProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should delete comment successfully', async () => {
      mockRequest.params = { commentId: 'cm12345678901234567890' };
      (mockRequest as any).authUserId = 'user123';
      mockService.delete.mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.delete).toHaveBeenCalledWith('cm12345678901234567890', 'user123');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw AppError for invalid comment ID', async () => {
      mockRequest.params = { commentId: 'invalid-id' };

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.delete).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      mockRequest.params = { commentId: 'cm12345678901234567890' };
      (mockRequest as any).authUserId = 'user123';
      mockService.delete.mockRejectedValue(error);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
