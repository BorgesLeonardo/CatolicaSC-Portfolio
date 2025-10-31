import { MeController } from '../../../controllers/me.controller'

// Mock Prisma with required surface
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    contribution: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    project: {
      count: jest.fn(),
      findMany: jest.fn(),
      fields: { goalCents: 'goalCents' },
    },
    $queryRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
  },
}))

const { prisma } = jest.requireMock('../../../infrastructure/prisma') as any

function mockReqRes(authUserId = 'u1', query: Record<string, any> = {}) {
  const req: any = { authUserId, query }
  const json = jest.fn()
  const status = jest.fn().mockImplementation(function (this: any) { return this })
  const res: any = { json, status }
  return { req, res, json }
}

describe('MeController', () => {
  let controller: MeController
  beforeEach(() => {
    controller = new MeController()
    jest.clearAllMocks()
  })

  it('metrics should compute and return aggregates', async () => {
    prisma.contribution.aggregate
      .mockResolvedValueOnce({ _sum: { amountCents: 12345 } })
      .mockResolvedValueOnce({ _sum: { amountCents: 67890 } })
      .mockResolvedValueOnce({ _sum: { amountCents: 5000 }, _count: { _all: 4 } })
    prisma.project.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(4)
    prisma.project.count.mockResolvedValueOnce(3) // hits

    const { req, res, json } = mockReqRes('u1')
    await controller.metrics(req as any, res as any)

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      totalSupportedBRL: 123.45,
      totalRaisedOnMyCampaignsBRL: 678.9,
      activeCampaigns: 2,
      publishedCampaigns: 4,
      successRatePct: Math.round((3 / 4) * 100),
    }))
  })

  it('contributionsTimeseries should return rows', async () => {
    prisma.$queryRawUnsafe.mockResolvedValue([{ period: '2025-01', amount: 10 }])
    const { req, res, json } = mockReqRes('u2', { from: '2025-01-01', to: '2025-12-31', interval: 'month' })
    await controller.contributionsTimeseries(req as any, res as any)
    expect(json).toHaveBeenCalledWith([{ period: '2025-01', amount: 10 }])
  })

  it('campaignsMetrics should return two datasets', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ projectId: 'p1', title: 'T', raised: 100, goal: 200 }])
    prisma.$queryRaw.mockResolvedValueOnce([{ category: 'C', count: 2, raised: 50 }])
    const { req, res, json } = mockReqRes('u3')
    await controller.campaignsMetrics(req as any, res as any)
    expect(json).toHaveBeenCalledWith({ topByRaised: [{ projectId: 'p1', title: 'T', raised: 100, goal: 200 }], byCategory: [{ category: 'C', count: 2, raised: 50 }] })
  })

  it('campaignsMetrics SQL should filter soft-deleted projects', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([])
    prisma.$queryRaw.mockResolvedValueOnce([])
    const { req, res } = mockReqRes('u6')
    await controller.campaignsMetrics(req as any, res as any)
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2)
    const firstSqlParts = prisma.$queryRaw.mock.calls[0][0] as TemplateStringsArray
    const secondSqlParts = prisma.$queryRaw.mock.calls[1][0] as TemplateStringsArray
    const firstSql = Array.isArray(firstSqlParts) ? firstSqlParts.join(' ') : String(firstSqlParts)
    const secondSql = Array.isArray(secondSqlParts) ? secondSqlParts.join(' ') : String(secondSqlParts)
    expect(firstSql).toContain('"deletedAt" IS NULL')
    expect(secondSql).toContain('"deletedAt" IS NULL')
  })

  it('campaignsList should paginate and map items', async () => {
    prisma.project.findMany.mockResolvedValueOnce([
      { id: 'p1', title: 'A', status: 'PUBLISHED', goalCents: 1000, raisedCents: 500, deadline: new Date(), contributions: [{ id: 'c1' }] },
    ])
    prisma.project.count.mockResolvedValueOnce(1)
    const { req, res, json } = mockReqRes('u4', { page: '1', pageSize: '10', status: 'PUBLISHED', q: 'A' })
    await controller.campaignsList(req as any, res as any)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ total: 1, items: expect.any(Array) }))
  })

  it('campaignsList should exclude soft-deleted items in where clause', async () => {
    prisma.project.findMany.mockResolvedValueOnce([])
    prisma.project.count.mockResolvedValueOnce(0)
    const { req, res } = mockReqRes('u7', { page: '1', pageSize: '10' })
    await controller.campaignsList(req as any, res as any)
    const args = prisma.project.findMany.mock.calls[0][0]
    expect(args.where).toEqual(expect.objectContaining({ ownerId: 'u7', deletedAt: null }))
  })

  it('payouts should return empty structure', async () => {
    const { req, res, json } = mockReqRes('u5')
    await controller.payouts(req as any, res as any)
    expect(json).toHaveBeenCalledWith({ items: [], total: 0 })
  })
})


