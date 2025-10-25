import { CommentsService } from '../../../services/comments.service'
import { AppError } from '../../../utils/AppError'
import { prisma } from '../../../infrastructure/prisma'

// Mock Prisma
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
    },
    user: {
      upsert: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as any

describe('CommentsService', () => {
  let service: CommentsService

  beforeEach(() => {
    service = new CommentsService()
    jest.clearAllMocks()
  })

  describe('create', () => {
    const mockData = {
      content: 'This is a test comment',
    }

    it('should create comment successfully', async () => {
      const projectId = 'project-1'
      const userId = 'user-1'
      const mockProject = {
        id: projectId,
        title: 'Test Project',
        deletedAt: null,
      }
      const mockComment = {
        id: 'comment-1',
        projectId,
        authorId: userId,
        content: mockData.content,
        createdAt: new Date(),
        author: {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
        },
      }

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)
      mockPrisma.user.upsert.mockResolvedValue({ id: userId } as any)
      mockPrisma.comment.create.mockResolvedValue(mockComment as any)

      const result = await service.create(projectId, mockData, userId)

      expect(result).toEqual(mockComment)
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
      })
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: userId },
        update: {},
        create: { id: userId, name: null, email: null },
      })
      expect(mockPrisma.comment.create).toHaveBeenCalledWith({
        data: {
          projectId,
          authorId: userId,
          content: mockData.content,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })

    it('should throw AppError when project not found', async () => {
      const projectId = 'non-existent'
      const userId = 'user-1'
      mockPrisma.project.findUnique.mockResolvedValue(null)

      await expect(service.create(projectId, mockData, userId)).rejects.toThrow(
        new AppError('Project not found', 404)
      )
    })

    it('should throw AppError when project is deleted', async () => {
      const projectId = 'project-1'
      const userId = 'user-1'
      const mockProject = {
        id: projectId,
        title: 'Test Project',
        deletedAt: new Date(), // Deleted project
      }

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)

      await expect(service.create(projectId, mockData, userId)).rejects.toThrow(
        new AppError('Project not found', 404)
      )
    })

    it('should create comment with empty content', async () => {
      const projectId = 'project-1'
      const userId = 'user-1'
      const emptyData = { content: '' }
      const mockProject = {
        id: projectId,
        title: 'Test Project',
        deletedAt: null,
      }
      const mockComment = {
        id: 'comment-1',
        projectId,
        authorId: userId,
        content: emptyData.content,
        createdAt: new Date(),
        author: {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
        },
      }

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)
      mockPrisma.user.upsert.mockResolvedValue({ id: userId } as any)
      mockPrisma.comment.create.mockResolvedValue(mockComment as any)

      const result = await service.create(projectId, emptyData, userId)
      expect(result).toEqual(mockComment)
    })

    it('should create comment with long content', async () => {
      const projectId = 'project-1'
      const userId = 'user-1'
      const longContent = 'a'.repeat(1001) // Exceeds 1000 character limit
      const longData = { content: longContent }
      const mockProject = {
        id: projectId,
        title: 'Test Project',
        deletedAt: null,
      }
      const mockComment = {
        id: 'comment-1',
        projectId,
        authorId: userId,
        content: longData.content,
        createdAt: new Date(),
        author: {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
        },
      }

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)
      mockPrisma.user.upsert.mockResolvedValue({ id: userId } as any)
      mockPrisma.comment.create.mockResolvedValue(mockComment as any)

      const result = await service.create(projectId, longData, userId)
      expect(result).toEqual(mockComment)
    })

    it('should handle database errors', async () => {
      const projectId = 'project-1'
      const userId = 'user-1'
      const mockProject = {
        id: projectId,
        title: 'Test Project',
        deletedAt: null,
      }

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)
      mockPrisma.user.upsert.mockResolvedValue({ id: userId } as any)
      mockPrisma.comment.create.mockRejectedValue(new Error('Database error'))

      await expect(service.create(projectId, mockData, userId)).rejects.toThrow('Database error')
    })
  })

  describe('listByProject', () => {
    it('should list comments with default pagination', async () => {
      const projectId = 'project-1'
      const mockComments = [
        { id: 'comment-1', content: 'Comment 1', authorId: 'user-1' },
        { id: 'comment-2', content: 'Comment 2', authorId: 'user-2' },
      ]
      const mockCount = 2

      mockPrisma.comment.findMany.mockResolvedValue(mockComments as any)
      mockPrisma.comment.count.mockResolvedValue(mockCount)

      const result = await service.listByProject(projectId)

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
        items: mockComments,
      })

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })

    it('should list comments with custom pagination', async () => {
      const projectId = 'project-1'
      const page = 2
      const pageSize = 5
      const mockComments = [
        { id: 'comment-1', content: 'Comment 1', authorId: 'user-1' },
      ]
      const mockCount = 12

      mockPrisma.comment.findMany.mockResolvedValue(mockComments as any)
      mockPrisma.comment.count.mockResolvedValue(mockCount)

      const result = await service.listByProject(projectId, page, pageSize)

      expect(result).toEqual({
        page: 2,
        pageSize: 5,
        total: 12,
        items: mockComments,
      })

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip: 5, // (page - 1) * pageSize
        take: 5,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })

    it('should handle negative page values', async () => {
      const projectId = 'project-1'
      const mockComments: any[] = []
      const mockCount = 0

      mockPrisma.comment.findMany.mockResolvedValue(mockComments as any)
      mockPrisma.comment.count.mockResolvedValue(mockCount)

      // Test negative page - service doesn't clamp, so it will use the negative value
      await service.listByProject(projectId, -1, 10)
      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: -20, // (page - 1) * pageSize = (-1 - 1) * 10 = -20
        })
      )

      // Test large pageSize - service doesn't clamp, so it will use the large value
      await service.listByProject(projectId, 1, 1000)
      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1000, // Service doesn't clamp this value
        })
      )
    })

    it('should handle database errors', async () => {
      const projectId = 'project-1'
      mockPrisma.comment.findMany.mockRejectedValue(new Error('Database error'))

      await expect(service.listByProject(projectId)).rejects.toThrow('Database error')
    })
  })

  describe('delete', () => {
    it('should delete comment successfully', async () => {
      const commentId = 'comment-1'
      const userId = 'user-1'
      const mockComment = {
        id: commentId,
        content: 'Test comment',
        authorId: userId,
        project: { ownerId: userId },
      }

      mockPrisma.comment.findUnique.mockResolvedValue(mockComment as any)
      mockPrisma.comment.delete.mockResolvedValue(mockComment as any)

      await service.delete(commentId, userId)

      expect(mockPrisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        include: { project: true },
      })
      expect(mockPrisma.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      })
    })

    it('should handle database errors', async () => {
      const commentId = 'comment-1'
      const userId = 'user-1'
      const mockComment = {
        id: commentId,
        content: 'Test comment',
        authorId: userId,
        project: { ownerId: userId },
      }

      mockPrisma.comment.findUnique.mockResolvedValue(mockComment as any)
      mockPrisma.comment.delete.mockRejectedValue(new Error('Database error'))

      await expect(service.delete(commentId, userId)).rejects.toThrow('Database error')
    })
  })
})
