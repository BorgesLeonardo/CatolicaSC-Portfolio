import { Request, Response, NextFunction } from 'express'
import { ProjectVideosController } from '../../../controllers/project-videos.controller'
import { AppError } from '../../../utils/AppError'

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFile: jest.fn((path: string, data: Buffer, cb: Function) => cb(null)),
  unlink: jest.fn((path: string, cb: Function) => cb(null)),
  mkdir: jest.fn((path: string, opts: any, cb: Function) => cb(null)),
  access: jest.fn((path: string, mode: number, cb: Function) => cb(null)),
}))

jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const { prisma } = jest.requireMock('../../../infrastructure/prisma') as any

describe('ProjectVideosController', () => {
  let controller: ProjectVideosController
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    controller = new ProjectVideosController()
    mockReq = { params: { projectId: 'cm12345678901234567890' } }
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()

    jest.clearAllMocks()
  })

  describe('uploadVideo', () => {
    it('uploads a video and updates project videoUrl', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({
        ownerId: 'user_1',
        deletedAt: null,
        videoUrl: null,
      })
      ;(prisma.project.update as jest.Mock).mockResolvedValue({ id: 'p1', videoUrl: '/uploads/projects/videos/any.mp4' })

      ;(mockReq as any).authUserId = 'user_1'
      ;(mockReq as any).file = {
        originalname: 'video.mp4',
        mimetype: 'video/mp4',
        size: 10 * 1024 * 1024,
        buffer: Buffer.from('video'),
      }

      await controller.uploadVideo(mockReq as Request, mockRes as Response, mockNext)

      expect(prisma.project.findUnique).toHaveBeenCalled()
      expect(prisma.project.update).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Video uploaded successfully', videoUrl: expect.any(String) }),
      )
    })

    it('removes old local video if exists during upload', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({
        ownerId: 'user_1',
        deletedAt: null,
        videoUrl: '/uploads/projects/videos/old.mp4',
      })
      ;(prisma.project.update as jest.Mock).mockResolvedValue({ id: 'p1', videoUrl: '/uploads/projects/videos/new.mp4' })

      ;(mockReq as any).authUserId = 'user_1'
      ;(mockReq as any).file = {
        originalname: 'video.mp4',
        mimetype: 'video/mp4',
        size: 1024,
        buffer: Buffer.from('video'),
      }

      await controller.uploadVideo(mockReq as Request, mockRes as Response, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(201)
    })

    it('rejects when no file is provided', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ ownerId: 'user_1', deletedAt: null, videoUrl: null })
      ;(mockReq as any).authUserId = 'user_1'
      ;(mockReq as any).file = undefined

      await controller.uploadVideo(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
      const err = (mockNext as jest.Mock).mock.calls[0][0] as AppError
      expect(err.statusCode).toBe(400)
    })

    it('forbids when user is not owner', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ ownerId: 'other', deletedAt: null, videoUrl: null })
      ;(mockReq as any).authUserId = 'user_1'
      ;(mockReq as any).file = {
        originalname: 'video.mp4',
        mimetype: 'video/mp4',
        size: 1,
        buffer: Buffer.from('x'),
      }

      await controller.uploadVideo(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
      const err = (mockNext as jest.Mock).mock.calls[0][0] as AppError
      expect(err.statusCode).toBe(403)
    })

    it('rejects invalid mimetype', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ ownerId: 'user_1', deletedAt: null, videoUrl: null })
      ;(mockReq as any).authUserId = 'user_1'
      ;(mockReq as any).file = {
        originalname: 'video.txt',
        mimetype: 'text/plain',
        size: 100,
        buffer: Buffer.from('bad'),
      }

      await controller.uploadVideo(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
      const err = (mockNext as jest.Mock).mock.calls[0][0] as AppError
      expect(err.statusCode).toBe(400)
    })

    it('rejects when size exceeds 100MB', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ ownerId: 'user_1', deletedAt: null, videoUrl: null })
      ;(mockReq as any).authUserId = 'user_1'
      ;(mockReq as any).file = {
        originalname: 'big.mp4',
        mimetype: 'video/mp4',
        size: 101 * 1024 * 1024,
        buffer: Buffer.alloc(1),
      }

      await controller.uploadVideo(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
      const err = (mockNext as jest.Mock).mock.calls[0][0] as AppError
      expect(err.statusCode).toBe(400)
    })

    it('rejects when params are invalid', async () => {
      mockReq.params = { projectId: 'invalid-id' } as any
      await controller.uploadVideo(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
    })
  })

  describe('deleteVideo', () => {
    it('deletes local file if present and clears videoUrl', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({
        ownerId: 'user_1',
        deletedAt: null,
        videoUrl: '/uploads/projects/videos/old.mp4',
      })
      ;(prisma.project.update as jest.Mock).mockResolvedValue({})
      ;(mockReq as any).authUserId = 'user_1'

      await controller.deleteVideo(mockReq as Request, mockRes as Response, mockNext)

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'cm12345678901234567890' },
        data: { videoUrl: null },
      })
      expect(mockRes.status).toHaveBeenCalledWith(204)
      expect(mockRes.send).toHaveBeenCalled()
    })

    it('rejects when params are invalid', async () => {
      mockReq.params = { projectId: 'invalid-id' } as any
      await controller.deleteVideo(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
    })
  })
})


