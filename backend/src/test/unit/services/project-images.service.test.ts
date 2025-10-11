import { ProjectImagesService, UploadedImageFile } from '../../../services/project-images.service'
import { AppError } from '../../../utils/AppError'

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFile: jest.fn((p: string, b: Buffer, cb: Function) => cb(null)),
  unlink: jest.fn((p: string, cb: Function) => cb(null)),
}))

jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
    },
    projectImage: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

const { prisma } = jest.requireMock('../../../infrastructure/prisma') as any

describe('ProjectImagesService', () => {
  let service: ProjectImagesService

  beforeEach(() => {
    service = new ProjectImagesService()
    jest.clearAllMocks()
  })

  describe('uploadImages', () => {
    const projectId = 'cm12345678901234567890'
    const file = (name: string): UploadedImageFile => ({
      originalname: name,
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from('img'),
    })

    it('saves valid images and returns created rows', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: projectId, deletedAt: null })
      ;(prisma.projectImage.count as jest.Mock).mockResolvedValue(0)
      ;(prisma.projectImage.create as jest.Mock).mockImplementation(async ({ data }: any) => ({ id: 'img1', ...data }))

      const result = await service.uploadImages(projectId, [file('a.png'), file('b.png')])

      expect(prisma.projectImage.create).toHaveBeenCalledTimes(2)
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('id')
    })

    it('rejects when project not found', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(null)
      await expect(service.uploadImages(projectId, [file('a.png')])).rejects.toThrow(new AppError('Project not found', 404))
    })

    it('rejects when exceeding 5 images', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: projectId, deletedAt: null })
      ;(prisma.projectImage.count as jest.Mock).mockResolvedValue(5)
      await expect(service.uploadImages(projectId, [file('a.png')])).rejects.toThrow(
        new AppError('Maximum 5 images allowed per project', 400),
      )
    })

    it('rejects when file is not an image', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: projectId, deletedAt: null })
      ;(prisma.projectImage.count as jest.Mock).mockResolvedValue(0)
      const bad: UploadedImageFile = { ...file('a.txt'), mimetype: 'text/plain' }
      await expect(service.uploadImages(projectId, [bad])).rejects.toThrow(/not a valid image/)
    })

    it('rejects when file exceeds 5MB', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: projectId, deletedAt: null })
      ;(prisma.projectImage.count as jest.Mock).mockResolvedValue(0)
      const big: UploadedImageFile = { ...file('a.png'), size: 6 * 1024 * 1024 }
      await expect(service.uploadImages(projectId, [big])).rejects.toThrow(/exceeds 5MB limit/)
    })
  })

  describe('deleteImage', () => {
    const projectId = 'cm12345678901234567890'
    const userId = 'user_1'

    it('checks ownership, deletes file and db row, then reorders', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: projectId, ownerId: userId, deletedAt: null })
      ;(prisma.projectImage.findUnique as jest.Mock).mockResolvedValue({ id: 'img1', projectId, filename: 'f.png' })
      ;(prisma.projectImage.findMany as jest.Mock).mockResolvedValue([{ id: 'img1', order: 0 }])

      await service.deleteImage('img1', projectId, userId)

      expect(prisma.projectImage.delete).toHaveBeenCalledWith({ where: { id: 'img1' } })
    })

    it('forbids when user is not owner', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: projectId, ownerId: 'other', deletedAt: null })
      await expect(service.deleteImage('img1', projectId, userId)).rejects.toThrow(new AppError('Forbidden', 403))
    })
  })

  describe('deleteAllProjectImages', () => {
    const projectId = 'cm12345678901234567890'

    it('removes files and database rows', async () => {
      ;(prisma.projectImage.findMany as jest.Mock).mockResolvedValue([
        { id: 'i1', filename: 'a.png' },
        { id: 'i2', filename: 'b.png' },
      ])

      await service.deleteAllProjectImages(projectId)

      expect(prisma.projectImage.deleteMany).toHaveBeenCalledWith({ where: { projectId } })
    })
  })
})



