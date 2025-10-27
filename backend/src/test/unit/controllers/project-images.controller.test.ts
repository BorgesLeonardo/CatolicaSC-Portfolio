import { ProjectImagesController } from '../../../controllers/project-images.controller'
import { prisma } from '../../../infrastructure/prisma'

const mockService = {
  uploadImages: jest.fn(),
  getProjectImages: jest.fn(),
  deleteImage: jest.fn(),
  reorderImages: jest.fn(),
}

function mockRes() {
  const json = jest.fn()
  const send = jest.fn()
  const status = jest.fn().mockImplementation(function (this: any) { return this })
  const res: any = { json, send, status }
  return { res, json, send, status }
}

describe('ProjectImagesController', () => {
  let controller: ProjectImagesController
  const mockPrisma = prisma as any

  beforeEach(() => {
    controller = new ProjectImagesController(mockService as any)
    jest.clearAllMocks()
  })

  describe('uploadImages', () => {
    it('calls next with 400 when no files provided', async () => {
      const req: any = { params: { projectId: 'ckv3o9j8c00000123abcdxyz' }, files: [], authUserId: 'u1' }
      const { res } = mockRes()
      const next = jest.fn()
      await controller.uploadImages(req as any, res as any, next as any)
      expect(next).toHaveBeenCalled()
    })

    it('returns 404 when project not found', async () => {
      const file = { buffer: Buffer.from('img'), originalname: 'a.jpg', mimetype: 'image/jpeg', size: 10 }
      const req: any = { params: { projectId: 'ckv3o9j8c00000123abcdxyz' }, files: [file], authUserId: 'u1' }
      const { res } = mockRes()
      const next = jest.fn()
      mockPrisma.project.findUnique = jest.fn().mockResolvedValue(null)
      await controller.uploadImages(req as any, res as any, next as any)
      expect(next).toHaveBeenCalled()
    })

    it('returns 403 when user is not owner', async () => {
      const file = { buffer: Buffer.from('img'), originalname: 'a.jpg', mimetype: 'image/jpeg', size: 10 }
      const req: any = { params: { projectId: 'ckv3o9j8c00000123abcdxyz' }, files: [file], authUserId: 'u1' }
      const { res } = mockRes()
      const next = jest.fn()
      mockPrisma.project.findUnique = jest.fn().mockResolvedValue({ ownerId: 'u2', deletedAt: null })
      await controller.uploadImages(req as any, res as any, next as any)
      expect(next).toHaveBeenCalled()
    })

    it('returns 201 on success with uploaded images', async () => {
      const file = { buffer: Buffer.from('img'), originalname: 'a.jpg', mimetype: 'image/jpeg', size: 10 }
      const req: any = { params: { projectId: 'ckv3o9j8c00000123abcdxyz' }, files: [file], authUserId: 'u1' }
      const { res, status, json } = mockRes()
      const next = jest.fn()
      mockPrisma.project.findUnique = jest.fn().mockResolvedValue({ ownerId: 'u1', deletedAt: null })
      ;(mockService.uploadImages as jest.Mock).mockResolvedValue([{ id: 'img1' }])

      await controller.uploadImages(req as any, res as any, next as any)
      expect(status).toHaveBeenCalledWith(201)
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ images: [{ id: 'img1' }] }))
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('getProjectImages', () => {
    it('returns images for project', async () => {
      const req: any = { params: { projectId: 'ckv3o9j8c00000123abcdxyz' } }
      const { res, json } = mockRes()
      const next = jest.fn()
      ;(mockService.getProjectImages as jest.Mock).mockResolvedValue([{ id: 'img1' }])
      await controller.getProjectImages(req as any, res as any, next as any)
      expect(json).toHaveBeenCalledWith({ images: [{ id: 'img1' }] })
    })
  })

  describe('deleteImage', () => {
    it('returns 204 on success', async () => {
      const req: any = { params: { projectId: 'ckv3o9j8c00000123abcdxyz', imageId: 'ckv3o9j8c00000123abcdyzz' }, authUserId: 'u1' }
      const { res, status, send } = mockRes()
      const next = jest.fn()
      ;(mockService.deleteImage as jest.Mock).mockResolvedValue(undefined)
      await controller.deleteImage(req as any, res as any, next as any)
      expect(status).toHaveBeenCalledWith(204)
      expect(send).toHaveBeenCalled()
    })
  })

  describe('reorderImages', () => {
    it('calls next with 400 on invalid body', async () => {
      const req: any = { params: { projectId: 'ckv3o9j8c00000123abcdxyz' }, body: {}, authUserId: 'u1' }
      const { res } = mockRes()
      const next = jest.fn()
      await controller.reorderImages(req as any, res as any, next as any)
      expect(next).toHaveBeenCalled()
    })

    it('calls next with 403 when not owner', async () => {
      const req: any = { params: { projectId: 'ckv3o9j8c00000123abcdxyz' }, body: { imageIds: ['ckv3o9j8c00000123abcdyzz'] }, authUserId: 'u1' }
      const { res } = mockRes()
      const next = jest.fn()
      mockPrisma.project.findUnique = jest.fn().mockResolvedValue({ ownerId: 'u2', deletedAt: null })
      await controller.reorderImages(req as any, res as any, next as any)
      expect(next).toHaveBeenCalled()
    })

    it('returns json on success', async () => {
      const req: any = { params: { projectId: 'ckv3o9j8c00000123abcdxyz' }, body: { imageIds: ['ckv3o9j8c00000123abcdyzz'] }, authUserId: 'u1' }
      const { res, json } = mockRes()
      const next = jest.fn()
      mockPrisma.project.findUnique = jest.fn().mockResolvedValue({ ownerId: 'u1', deletedAt: null })
      await controller.reorderImages(req as any, res as any, next as any)
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Images reordered successfully' }))
    })
  })
})


