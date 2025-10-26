import { StatsController } from '../../../controllers/stats.controller'

// Extend global prisma mock surface for this controller
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    project: { count: jest.fn(), fields: { goalCents: 'goalCents' } },
    contribution: { aggregate: jest.fn(), findMany: jest.fn() },
  },
}))

const { prisma } = jest.requireMock('../../../infrastructure/prisma') as any

function mockReqRes(query: Record<string, any> = {}) {
  const req: any = { query }
  const json = jest.fn()
  const res: any = { json }
  return { req, res, json }
}

describe('StatsController', () => {
  let controller: StatsController
  beforeEach(() => {
    controller = new StatsController()
    jest.clearAllMocks()
  })

  it('platformMetrics should compute metrics without date filters', async () => {
    prisma.project.count
      .mockResolvedValueOnce(10) // totalProjects
      .mockResolvedValueOnce(10) // published
      .mockResolvedValueOnce(7) // hits
    prisma.contribution.aggregate.mockResolvedValue({ _sum: { amountCents: 123456 } })
    prisma.contribution.findMany.mockResolvedValue([{ contributorId: 'a' }, { contributorId: 'b' }])

    const { req, res, json } = mockReqRes()
    await controller.platformMetrics(req as any, res as any)
    expect(json).toHaveBeenCalledWith({
      totalProjects: 10,
      totalRaisedCents: 123456,
      totalRaisedBRL: 1234.56,
      totalBackers: 2,
      successRatePct: Math.round((7 / 10) * 100),
    })
  })

  it('platformMetrics should respect from/to filters', async () => {
    prisma.project.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(1)
    prisma.contribution.aggregate.mockResolvedValue({ _sum: { amountCents: 0 } })
    prisma.contribution.findMany.mockResolvedValue([])

    const { req, res } = mockReqRes({ from: '2025-01-01', to: '2025-12-31' })
    await controller.platformMetrics(req as any, res as any)
    expect(prisma.contribution.aggregate).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ createdAt: expect.any(Object) })
    }))
    expect(prisma.contribution.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ createdAt: expect.any(Object) })
    }))
  })
})


