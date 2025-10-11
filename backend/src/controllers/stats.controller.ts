import { Request, Response } from 'express'
import { prisma } from '../infrastructure/prisma'

export class StatsController {
  /**
   * Retorna métricas globais da plataforma
   * - totalProjects: número de campanhas publicadas
   * - totalRaisedCents: total arrecadado em contribuições com status SUCCEEDED (centavos)
   * - totalBackers: número de apoiadores únicos com contribuições SUCCEEDED
   * - successRatePct: % de campanhas publicadas que atingiram a meta
   */
  async platformMetrics(req: Request, res: Response) {
    const { from, to } = req.query as { from?: string; to?: string }
    const fromDate = from ? new Date(from) : undefined
    const toDate = to ? new Date(to) : undefined
    // Campanhas publicadas ativas (ignora deletadas)
    const totalProjects = await prisma.project.count({
      where: { status: 'PUBLISHED', deletedAt: null }
    })

    // Total arrecadado (centavos) em contribuições concluídas
    const contribAgg = await prisma.contribution.aggregate({
      _sum: { amountCents: true },
      where: {
        status: 'SUCCEEDED',
        ...(fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : {})
      }
    })
    const totalRaisedCents = contribAgg._sum.amountCents || 0

    // Apoiadores únicos com contribuições concluídas
    const distinctBackers = await prisma.contribution.findMany({
      where: {
        status: 'SUCCEEDED',
        contributorId: { not: null },
        ...(fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : {})
      },
      distinct: ['contributorId'],
      select: { contributorId: true }
    })
    const totalBackers = distinctBackers.length

    // Taxa de sucesso: publicadas que atingiram a meta (raisedCents >= goalCents)
    const published = await prisma.project.count({ where: { status: 'PUBLISHED', deletedAt: null } })
    const hits = await prisma.project.count({
      where: { status: 'PUBLISHED', deletedAt: null, raisedCents: { gte: prisma.project.fields.goalCents } }
    })
    const successRatePct = published ? Math.round((hits / published) * 100) : 0

    res.json({
      totalProjects,
      totalRaisedCents,
      totalRaisedBRL: totalRaisedCents / 100,
      totalBackers,
      successRatePct
    })
  }
}

export const statsController = new StatsController()


