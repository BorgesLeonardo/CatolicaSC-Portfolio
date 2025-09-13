import { Request, Response, NextFunction } from 'express';
import { ProjectsController } from '../../controllers/projects.controller';
import { ProjectsService } from '../../services/projects.service';
import { AppError } from '../../utils/AppError';

// Mock do service
jest.mock('../../services/projects.service');
jest.mock('../../services/project-stats.service', () => ({
  projectStatsService: {
    updateAllProjectsStats: jest.fn()
  }
}));

const MockedProjectsService = ProjectsService as jest.MockedClass<typeof ProjectsService>;

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let mockService: jest.Mocked<ProjectsService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockService = {
      create: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
      getByOwner: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;

    controller = new ProjectsController(mockService);
    
    mockRequest = {
      body: {},
      params: {},
      query: {},
      header: jest.fn()
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

    jest.clearAllMocks();
  });

  describe('create', () => {
    const validProjectData = {
      title: 'Test Project',
      description: 'A test project description',
      goalCents: 10000,
      deadline: '2024-12-31T23:59:59Z',
      imageUrl: 'https://example.com/image.jpg',
      categoryId: 'cat1'
    };

    it('should create project successfully', async () => {
      const mockProject = { id: 'proj1', ...validProjectData };
      mockService.create.mockResolvedValue(mockProject as any);
      mockRequest.body = validProjectData;
      (mockRequest as any).authUserId = 'user1';

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.create).toHaveBeenCalledWith(validProjectData, 'user1');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProject);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidData = { title: 'A' }; // Too short
      mockRequest.body = invalidData;

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext.mock.calls[0][0] as AppError).statusCode).toBe(400);
      expect((mockNext.mock.calls[0][0] as AppError).message).toBe('ValidationError');
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('Service error', 500);
      mockService.create.mockRejectedValue(serviceError);
      mockRequest.body = validProjectData;
      (mockRequest as any).authUserId = 'user1';

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('list', () => {
    it('should list projects with default parameters', async () => {
      const mockResult = {
        page: 1,
        pageSize: 10,
        total: 2,
        items: [
          { id: 'proj1', title: 'Project 1' },
          { id: 'proj2', title: 'Project 2' }
        ]
      };
      mockService.list.mockResolvedValue(mockResult as any);

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        q: undefined,
        ownerId: undefined,
        categoryId: undefined,
        active: false
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle query parameters', async () => {
      const mockResult = { page: 1, pageSize: 5, total: 1, items: [] };
      mockService.list.mockResolvedValue(mockResult as any);
      mockRequest.query = {
        page: '2',
        pageSize: '5',
        q: 'test',
        ownerId: 'user1',
        categoryId: 'cat1',
        active: 'true'
      };

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.list).toHaveBeenCalledWith({
        page: 2,
        pageSize: 5,
        q: 'test',
        ownerId: 'user1',
        categoryId: 'cat1',
        active: true
      });
    });

    it('should handle invalid page parameters', async () => {
      const mockResult = { page: 1, pageSize: 10, total: 0, items: [] };
      mockService.list.mockResolvedValue(mockResult as any);
      mockRequest.query = { page: '0', pageSize: '0' };

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.list).toHaveBeenCalledWith({
        page: 1, // Should be at least 1
        pageSize: 1, // Should be at least 1
        q: undefined,
        ownerId: undefined,
        categoryId: undefined,
        active: false
      });
    });

    it('should handle large page size', async () => {
      const mockResult = { page: 1, pageSize: 50, total: 0, items: [] };
      mockService.list.mockResolvedValue(mockResult as any);
      mockRequest.query = { pageSize: '100' };

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 50, // Should be limited to 50
        q: undefined,
        ownerId: undefined,
        categoryId: undefined,
        active: false
      });
    });
  });

  describe('getById', () => {
    it('should get project by id', async () => {
      const mockProject = { id: 'proj1', title: 'Test Project' };
      mockService.getById.mockResolvedValue(mockProject as any);
      mockRequest.params = { id: 'proj1' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.getById).toHaveBeenCalledWith('proj1');
      expect(mockResponse.json).toHaveBeenCalledWith(mockProject);
    });

    it('should handle invalid id', async () => {
      mockRequest.params = { id: 'invalid' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext.mock.calls[0][0] as AppError).statusCode).toBe(400);
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('Project not found', 404);
      mockService.getById.mockRejectedValue(serviceError);
      mockRequest.params = { id: 'proj1' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getByOwner', () => {
    it('should get projects by owner', async () => {
      const mockResult = {
        items: [
          { id: 'proj1', title: 'Project 1' },
          { id: 'proj2', title: 'Project 2' }
        ]
      };
      mockService.getByOwner.mockResolvedValue(mockResult as any);
      (mockRequest as any).authUserId = 'user1';

      await controller.getByOwner(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.getByOwner).toHaveBeenCalledWith('user1');
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('Service error', 500);
      mockService.getByOwner.mockRejectedValue(serviceError);
      (mockRequest as any).authUserId = 'user1';

      await controller.getByOwner(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('update', () => {
    const validUpdateData = {
      title: 'Updated Project',
      description: 'Updated description'
    };

    it('should update project successfully', async () => {
      const mockUpdatedProject = { id: 'proj1', ...validUpdateData };
      mockService.update.mockResolvedValue(mockUpdatedProject as any);
      mockRequest.params = { id: 'proj1' };
      mockRequest.body = validUpdateData;
      (mockRequest as any).authUserId = 'user1';

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.update).toHaveBeenCalledWith('proj1', validUpdateData, 'user1');
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedProject);
    });

    it('should handle validation errors for params', async () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = validUpdateData;

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext.mock.calls[0][0] as AppError).statusCode).toBe(400);
    });

    it('should handle validation errors for body', async () => {
      const invalidData = { title: 'A' }; // Too short
      mockRequest.params = { id: 'proj1' };
      mockRequest.body = invalidData;

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext.mock.calls[0][0] as AppError).statusCode).toBe(400);
    });

    it('should handle empty update data', async () => {
      mockRequest.params = { id: 'proj1' };
      mockRequest.body = {};

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext.mock.calls[0][0] as AppError).statusCode).toBe(400);
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('Forbidden', 403);
      mockService.update.mockRejectedValue(serviceError);
      mockRequest.params = { id: 'proj1' };
      mockRequest.body = validUpdateData;
      (mockRequest as any).authUserId = 'user1';

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('delete', () => {
    it('should delete project successfully', async () => {
      mockService.delete.mockResolvedValue(undefined);
      mockRequest.params = { id: 'proj1' };
      (mockRequest as any).authUserId = 'user1';

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.delete).toHaveBeenCalledWith('proj1', 'user1');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      mockRequest.params = { id: 'invalid' };

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext.mock.calls[0][0] as AppError).statusCode).toBe(400);
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('Forbidden', 403);
      mockService.delete.mockRejectedValue(serviceError);
      mockRequest.params = { id: 'proj1' };
      (mockRequest as any).authUserId = 'user1';

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('updateAllStats', () => {
    it('should update all project stats successfully', async () => {
      const { projectStatsService } = require('../../services/project-stats.service');
      projectStatsService.updateAllProjectsStats.mockResolvedValue(undefined);

      await controller.updateAllStats(mockRequest as Request, mockResponse as Response, mockNext);

      expect(projectStatsService.updateAllProjectsStats).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Estatísticas atualizadas com sucesso',
        timestamp: expect.any(String)
      });
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('Stats update failed', 500);
      const { projectStatsService } = require('../../services/project-stats.service');
      projectStatsService.updateAllProjectsStats.mockRejectedValue(serviceError);

      await controller.updateAllStats(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });
});
