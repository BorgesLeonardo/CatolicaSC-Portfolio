import { Request, Response } from 'express'
import { prisma } from '../infrastructure/prisma'
import { AppError } from '../utils/AppError'

export class MeController {
  async metrics(req: Request, res: Response) {
    const userId = (req as any).authUserId as string

    // Totais de contribuições feitas por mim (SUCCEEDED)
    const totalSupported = await prisma.contribution.aggregate({
      _sum: { amountCents: true },
      where: { contributorId: userId, status: 'SUCCEEDED' }
    })

    // Total arrecadado nas minhas campanhas (SUCCEEDED)
    const totalRaisedMine = await prisma.contribution.aggregate({
      _sum: { amountCents: true },
      where: { status: 'SUCCEEDED', project: { ownerId: userId } }
    })

    // Campanhas ativas/publicadas (ignorar removidas via soft delete)
    const [activeCampaigns, publishedCampaigns] = await Promise.all([
      prisma.project.count({ where: { ownerId: userId, status: 'PUBLISHED', deletedAt: null, deadline: { gt: new Date() } } }),
      prisma.project.count({ where: { ownerId: userId, status: 'PUBLISHED', deletedAt: null } })
    ])

    // Taxa de sucesso: atingiram goalCents
    const hits = await prisma.project.count({
      where: {
        ownerId: userId,
        status: 'PUBLISHED',
        deletedAt: null,
        raisedCents: { gte: prisma.project.fields.goalCents }
      }
    })
    const successRatePct = publishedCampaigns ? Math.round((hits / publishedCampaigns) * 100) : 0

    // Ticket médio das minhas contribuições (SUCCEEDED)
    const myContribsAgg = await prisma.contribution.aggregate({
      _sum: { amountCents: true },
      _count: { _all: true },
      where: { contributorId: userId, status: 'SUCCEEDED' }
    })
    const avgTicketCents = myContribsAgg._count._all ? Math.round((myContribsAgg._sum.amountCents || 0) / myContribsAgg._count._all) : 0

    res.json({
      totalSupportedBRL: (totalSupported._sum.amountCents || 0) / 100,
      totalRaisedOnMyCampaignsBRL: (totalRaisedMine._sum.amountCents || 0) / 100,
      activeCampaigns,
      publishedCampaigns,
      successRatePct,
      avgTicketBRL: avgTicketCents / 100
    })
  }

  async contributionsTimeseries(req: Request, res: Response) {
    const userId = (req as any).authUserId as string
    const { from, to, interval } = req.query as { from?: string; to?: string; interval?: string }

    // Validação simples
    if (interval && interval !== 'month') {
      throw new AppError('Invalid interval', 422)
    }

    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
    const toDate = to ? new Date(to) : new Date()

    // Query raw para performance e controle do período (Postgres)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const rows = await prisma.$queryRawUnsafe<Array<{ period: string; amount: number }>>(`
      SELECT to_char(date_trunc('month', c."createdAt"), 'YYYY-MM') AS period,
             (SUM(c."amountCents")/100.0)::float8 AS amount
      FROM "Contribution" c
      WHERE c."contributorId" = $1 AND c."status" = 'SUCCEEDED'
        AND c."createdAt" BETWEEN $2 AND $3
      GROUP BY 1
      ORDER BY 1 ASC
    `, userId, fromDate, toDate)

    res.json(rows)
  }

  async campaignsMetrics(req: Request, res: Response) {
    const userId = (req as any).authUserId as string

    // Top 5 por arrecadação
    const topRaw = await prisma.$queryRaw<Array<{ projectId: string; title: string; raised: number; goal: number }>>`
      SELECT p.id as "projectId", p.title,
             (p."raisedCents"/100.0)::float8 as raised,
             (p."goalCents"/100.0)::float8 as goal
      FROM "Project" p
      WHERE p."ownerId" = ${userId} AND p."status" = 'PUBLISHED'
      ORDER BY p."raisedCents" DESC
      LIMIT 5
    `

    // Distribuição por categoria
    const byCategory = await prisma.$queryRaw<Array<{ category: string; count: number; raised: number }>>`
      SELECT COALESCE(c.name, 'Sem categoria') as category,
             COUNT(p.id)::int as count,
             (SUM(p."raisedCents")/100.0)::float8 as raised
      FROM "Project" p
      LEFT JOIN "Category" c ON c.id = p."categoryId"
      WHERE p."ownerId" = ${userId}
      GROUP BY c.name
      ORDER BY raised DESC
    `

    res.json({ topByRaised: topRaw, byCategory })
  }

  async campaignsList(req: Request, res: Response) {
    const userId = (req as any).authUserId as string
    const { status, q, page = '1', pageSize = '10' } = req.query as Record<string, string>

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const sizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10))

    const where: any = { ownerId: userId }
    if (status) where.status = status as any
    if (q) where.title = { contains: q, mode: 'insensitive' as const }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * sizeNum,
        take: sizeNum,
        select: {
          id: true,
          title: true,
          status: true,
          goalCents: true,
          raisedCents: true,
          deadline: true,
          contributions: { select: { id: true }, where: { status: 'SUCCEEDED' } },
        }
      }),
      prisma.project.count({ where })
    ])

    const mapped = items.map(p => ({
      id: p.id,
      title: p.title,
      status: p.status,
      goal: p.goalCents / 100,
      raised: p.raisedCents / 100,
      contributions: p.contributions.length,
      deadline: p.deadline,
    }))

    res.json({ page: pageNum, pageSize: sizeNum, total, items: mapped })
  }

  async payouts(req: Request, res: Response) {
    // Placeholder: não há modelo de payout no schema
    res.json({ items: [], total: 0 })
  }

  async contributionsList(req: Request, res: Response) {
    const userId = (req as any).authUserId as string
    const { page = '1', pageSize = '10', projectId, from, to, status } = req.query as Record<string, string>
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const sizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10))

    const where: any = { contributorId: userId }
    if (projectId) where.projectId = projectId
    if (status) where.status = status
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }

    const [items, total] = await Promise.all([
      prisma.contribution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * sizeNum,
        take: sizeNum,
        select: {
          id: true,
          amountCents: true,
          currency: true,
          status: true,
          createdAt: true,
          project: { select: { id: true, title: true } },
        }
      }),
      prisma.contribution.count({ where })
    ])

    const mapped = items.map(i => ({
      id: i.id,
      amount: i.amountCents / 100,
      currency: i.currency,
      status: i.status,
      createdAt: i.createdAt,
      projectId: i.project.id,
      projectTitle: i.project.title,
    }))

    res.json({ page: pageNum, pageSize: sizeNum, total, items: mapped })
  }
}


