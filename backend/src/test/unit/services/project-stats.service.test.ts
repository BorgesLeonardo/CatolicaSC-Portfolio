import { projectStatsService } from '../../../services/project-stats.service'
import { prisma } from '../../../infrastructure/prisma'

// Mock Prisma
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    contribution: {
      findMany: jest.fn(),
    },
  },
}))

// Mock the project stats service to avoid circular dependencies
// Use the real service implementation for these tests

const mockPrisma = prisma as any

describe('ProjectStatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateProjectStats', () => {
    it('should update project stats successfully', async () => {
      const projectId = 'project-1'
      const mockContributions = [
        { amountCents: 1000, contributorId: 'user-1' },
        { amountCents: 2000, contributorId: 'user-2' },
        { amountCents: 500, contributorId: 'user-1' }, // Same user, should count as 1 supporter
      ]

      mockPrisma.contribution.findMany.mockResolvedValue(mockContributions as any)
      mockPrisma.project.update.mockResolvedValue({} as any)

      const result = await projectStatsService.updateProjectStats(projectId)

      expect(result).toEqual({
        raisedCents: 3500,
        supportersCount: 2,
      })

      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith({
        where: {
          projectId,
          status: 'SUCCEEDED',
        },
      })

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: {
          raisedCents: 3500,
          supportersCount: 2,
        },
      })
    })

    it('should handle project not found', async () => {
      const projectId = 'non-existent'
      mockPrisma.contribution.findMany.mockResolvedValue([])
      mockPrisma.project.update.mockRejectedValue(new Error('Project not found'))

      await expect(projectStatsService.updateProjectStats(projectId)).rejects.toThrow('Project not found')

      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith({
        where: {
          projectId,
          status: 'SUCCEEDED',
        },
      })
    })

    it('should handle no contributions', async () => {
      const projectId = 'project-1'

      mockPrisma.contribution.findMany.mockResolvedValue([])
      mockPrisma.project.update.mockResolvedValue({} as any)

      const result = await projectStatsService.updateProjectStats(projectId)

      expect(result).toEqual({
        raisedCents: 0,
        supportersCount: 0,
      })

      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith({
        where: {
          projectId,
          status: 'SUCCEEDED',
        },
      })

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: {
          raisedCents: 0,
          supportersCount: 0,
        },
      })
    })
  })

  describe('updateAllProjectsStats', () => {
    it('should update all projects stats successfully', async () => {
      const mockProjects = [
        { id: 'project-1', title: 'Project 1' },
        { id: 'project-2', title: 'Project 2' },
        { id: 'project-3', title: 'Project 3' },
      ]

      mockPrisma.project.findMany.mockResolvedValue(mockProjects as any)
      mockPrisma.contribution.findMany.mockResolvedValue([])
      mockPrisma.project.update.mockResolvedValue({} as any)

      await projectStatsService.updateAllProjectsStats()

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        select: { id: true, title: true },
      })
    })

    it('should handle errors in batch processing', async () => {
      const mockProjects = [
        { id: 'project-1', title: 'Project 1' },
        { id: 'project-2', title: 'Project 2' },
      ]

      mockPrisma.project.findMany.mockResolvedValue(mockProjects as any)
      mockPrisma.contribution.findMany
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('Database error'))
      mockPrisma.project.update.mockResolvedValue({} as any)

      // Should not throw error even if individual project fails
      await expect(projectStatsService.updateAllProjectsStats()).resolves.not.toThrow()
    })
  })

  describe('validateProjectStats', () => {
    it('should validate correct stats', async () => {
      const projectId = 'project-1'
      const mockProject = {
        raisedCents: 3000,
        supportersCount: 2,
      }
      const mockContributions = [
        { amountCents: 1000, contributorId: 'user-1' },
        { amountCents: 2000, contributorId: 'user-2' },
      ]

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)
      mockPrisma.contribution.findMany.mockResolvedValue(mockContributions as any)

      const result = await projectStatsService.validateProjectStats(projectId)

      expect(result).toEqual({
        isValid: true,
        currentStats: {
          raisedCents: 3000,
          supportersCount: 2,
        },
        correctStats: {
          raisedCents: 3000,
          supportersCount: 2,
        },
      })
    })

    it('should detect incorrect stats', async () => {
      const projectId = 'project-1'
      const mockProject = {
        raisedCents: 2000, // Incorrect
        supportersCount: 1, // Incorrect
      }
      const mockContributions = [
        { amountCents: 1000, contributorId: 'user-1' },
        { amountCents: 2000, contributorId: 'user-2' },
      ]

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)
      mockPrisma.contribution.findMany.mockResolvedValue(mockContributions as any)

      const result = await projectStatsService.validateProjectStats(projectId)

      expect(result).toEqual({
        isValid: false,
        currentStats: {
          raisedCents: 2000,
          supportersCount: 1,
        },
        correctStats: {
          raisedCents: 3000,
          supportersCount: 2,
        },
      })
    })

    it('should handle project not found', async () => {
      const projectId = 'non-existent'
      mockPrisma.project.findUnique.mockResolvedValue(null)

      await expect(projectStatsService.validateProjectStats(projectId)).rejects.toThrow('Project not found')
    })

    it('should handle contributions with null contributorId', async () => {
      const projectId = 'project-1'
      const mockProject = {
        raisedCents: 1000,
        supportersCount: 1,
      }
      const mockContributions = [
        { amountCents: 1000, contributorId: 'user-1' },
        { amountCents: 500, contributorId: null }, // Should be filtered out
      ]

      mockPrisma.project.findUnique.mockResolvedValue(mockProject as any)
      mockPrisma.contribution.findMany.mockResolvedValue(mockContributions as any)

      const result = await projectStatsService.validateProjectStats(projectId)

      expect(result.correctStats.supportersCount).toBe(1)
    })
  })
})
