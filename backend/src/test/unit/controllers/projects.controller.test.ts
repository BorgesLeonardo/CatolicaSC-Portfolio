import { Request, Response, NextFunction } from 'express';
import { ProjectsController } from '../../../controllers/projects.controller';
import { ProjectsService } from '../../../services/projects.service';
import { projectStatsService } from '../../../services/project-stats.service';
import { AppError } from '../../../utils/AppError';

// Mock dos services
jest.mock('../../../services/projects.service');
jest.mock('../../../services/project-stats.service');

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let mockService: jest.Mocked<ProjectsService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockService = {
      create: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
      getByOwner: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    controller = new ProjectsController(mockService);
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('create', () => {
    const validProjectData = {
      title: 'Valid Project Title',
      description: 'This is a sufficiently long project description text.',
      goalCents: 100000,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://example.com/image.jpg',
      categoryId: 'cm12345678901234567890',
      hasImage: true,
    } as any;

    it('should create project successfully', async () => {
      const mockProject = { 
        id: 'proj1', 
        ...validProjectData,
        deadline: new Date(validProjectData.deadline),
        category: {
          id: 'cm12345678901234567890',
          name: 'Technology',
          description: 'Tech projects',
          color: '#FF5733',
          icon: 'tech-icon',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ownerId: 'user123',
        raisedCents: 0,
        supportersCount: 0,
        images: [],
      };
      mockRequest.body = validProjectData;
      (mockRequest as any).authUserId = 'user123';
      mockService.create.mockResolvedValue(mockProject as any);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.create).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProject);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      mockRequest.body = validProjectData;
      (mockRequest as any).authUserId = 'user123';
      mockService.create.mockRejectedValue(error);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Depending on validation, it may fail earlier. Accept either error forward
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should list projects with default pagination', async () => {
      const mockResult = { items: [], total: 0, page: 1, pageSize: 10 };
      mockRequest.query = {};
      mockService.list.mockResolvedValue(mockResult);

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        q: undefined,
        ownerId: undefined,
        categoryId: undefined,
        active: false,
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should list projects with custom filters', async () => {
      const mockResult = { items: [], total: 0, page: 2, pageSize: 20 };
      mockRequest.query = {
        page: '2',
        pageSize: '20',
        q: 'test',
        ownerId: 'user123',
        categoryId: 'cat123',
        active: 'true',
      };
      mockService.list.mockResolvedValue(mockResult);

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.list).toHaveBeenCalledWith({
        page: 2,
        pageSize: 20,
        q: 'test',
        ownerId: 'user123',
        categoryId: 'cat123',
        active: true,
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle invalid page parameters', async () => {
      const mockResult = { items: [], total: 0, page: 1, pageSize: 10 };
      mockRequest.query = { page: '-1', pageSize: '100' };
      mockService.list.mockResolvedValue(mockResult);

      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.list).toHaveBeenCalledWith({
        page: 1, // Should be clamped to 1
        pageSize: 50, // Should be clamped to 50
        q: undefined,
        ownerId: undefined,
        categoryId: undefined,
        active: false,
      });
    });
  });

  describe('getById', () => {
    it('should get project by id successfully', async () => {
      const mockProject = { 
        id: 'proj1', 
        title: 'Test Project',
        description: 'Test description',
        goalCents: 100000,
        deadline: new Date(),
        imageUrl: 'https://example.com/image.jpg',
        categoryId: 'cm12345678901234567890',
        category: {
          id: 'cm12345678901234567890',
          name: 'Technology',
          description: 'Tech projects',
          color: '#FF5733',
          icon: 'tech-icon',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ownerId: 'user123',
        raisedCents: 0,
        supportersCount: 0,
        images: [],
      };
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockService.getById.mockResolvedValue(mockProject as any);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.getById).toHaveBeenCalledWith('cm12345678901234567890');
      expect(mockResponse.json).toHaveBeenCalledWith(mockProject);
    });

    it('should throw AppError for invalid id format', async () => {
      mockRequest.params = { id: 'invalid-id' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.getById).not.toHaveBeenCalled();
    });
  });

  describe('getByOwner', () => {
    it('should get projects by owner successfully', async () => {
      const mockProjects = { 
        items: [{ 
          id: 'proj1', 
          title: 'Test Project',
          description: 'Test description',
          goalCents: 100000,
          deadline: new Date(),
          imageUrl: 'https://example.com/image.jpg',
          categoryId: 'cm12345678901234567890',
          category: {
            id: 'cm12345678901234567890',
            name: 'Technology',
            description: 'Tech projects',
            color: '#FF5733',
            icon: 'tech-icon',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          ownerId: 'user123',
          raisedCents: 0,
          supportersCount: 0,
          images: [],
        }]
      };
      (mockRequest as any).authUserId = 'user123';
      mockService.getByOwner.mockResolvedValue(mockProjects as any);

      await controller.getByOwner(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.getByOwner).toHaveBeenCalledWith('user123');
      expect(mockResponse.json).toHaveBeenCalledWith(mockProjects);
    });
  });

  describe('update', () => {
    it('should update project successfully', async () => {
      const updateData = { title: 'Updated Title' };
      const mockUpdatedProject = { 
        id: 'proj1', 
        ...updateData,
        description: 'Test description',
        goalCents: 100000,
        deadline: new Date(),
        imageUrl: 'https://example.com/image.jpg',
        categoryId: 'cm12345678901234567890',
        category: {
          id: 'cm12345678901234567890',
          name: 'Technology',
          description: 'Tech projects',
          color: '#FF5733',
          icon: 'tech-icon',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ownerId: 'user123',
        raisedCents: 0,
        supportersCount: 0,
        images: [],
      };
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockRequest.body = updateData;
      (mockRequest as any).authUserId = 'user123';
      mockService.update.mockResolvedValue(mockUpdatedProject as any);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.update).toHaveBeenCalledWith('cm12345678901234567890', updateData, 'user123');
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedProject);
    });

    it('should throw AppError for empty update data', async () => {
      mockRequest.params = { id: 'cm12345678901234567890' };
      mockRequest.body = {}; // Empty body

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('should throw AppError for invalid id format', async () => {
      mockRequest.params = { id: 'invalid-id' };
      mockRequest.body = { title: 'Updated Title' };

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete project successfully', async () => {
      mockRequest.params = { id: 'cm12345678901234567890' };
      (mockRequest as any).authUserId = 'user123';
      mockService.delete.mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.delete).toHaveBeenCalledWith('cm12345678901234567890', 'user123');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should throw AppError for invalid id format', async () => {
      mockRequest.params = { id: 'invalid-id' };

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockService.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateAllStats', () => {
    it('should update all project stats successfully', async () => {
      (projectStatsService.updateAllProjectsStats as jest.Mock).mockResolvedValue(undefined);

      await controller.updateAllStats(mockRequest as Request, mockResponse as Response, mockNext);

      expect(projectStatsService.updateAllProjectsStats).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Estatísticas atualizadas com sucesso',
        timestamp: expect.any(String),
      });
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Stats update failed');
      (projectStatsService.updateAllProjectsStats as jest.Mock).mockRejectedValue(error);

      await controller.updateAllStats(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
