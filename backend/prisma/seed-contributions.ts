import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getEnv(name: string, fallback?: string): string | undefined {
  const v = process.env[name]
  return v && v.trim().length > 0 ? v : fallback
}

async function ensureUser(userId: string) {
  await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId, name: 'Demo User', email: 'demo@example.com' } })
}

async function ensureCategory(): Promise<string> {
  const existing = await prisma.category.findFirst()
  if (existing) return existing.id
  const created = await prisma.category.create({ data: { name: 'Demonstracao', description: 'Categoria demo', color: '#1e40af' } })
  return created.id
}

async function ensureProject(ownerId: string): Promise<string> {
  // Try to reuse an existing published project owned by the user
  const existing = await prisma.project.findFirst({ where: { ownerId, status: 'PUBLISHED' } })
  if (existing) return existing.id

  const categoryId = await ensureCategory()
  const now = new Date()
  const deadline = new Date(now.getFullYear(), now.getMonth() + 2, 1)
  const created = await prisma.project.create({
    data: {
      ownerId,
      categoryId,
      title: 'Campanha Demo para Gráfico',
      description: 'Projeto de demonstração para popular dados do gráfico de contribuições por mês',
      goalCents: 500000, // R$ 5.000
      minContributionCents: 1000,
      status: 'PUBLISHED',
      startsAt: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      deadline,
    }
  })
  return created.id
}

function monthsBack(date: Date, back: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - back, 15)
}

async function main() {
  const demoUserId = getEnv('SEED_DEMO_USER_ID', 'user_demo_123') as string
  const contributionsPerMonth = parseInt(getEnv('SEED_CONTRIB_PER_MONTH', '3') || '3', 10)
  const months = parseInt(getEnv('SEED_MONTHS', '12') || '12', 10)

  console.log('Seeding contributions...', { demoUserId, contributionsPerMonth, months })

  await ensureUser(demoUserId)
  const projectId = await ensureProject(demoUserId)

  const now = new Date()

  // Create SUCCEEDED contributions distributed over the last N months
  for (let m = months - 1; m >= 0; m--) {
    const baseDate = monthsBack(now, m)
    for (let i = 0; i < contributionsPerMonth; i++) {
      const day = 3 + i * 3
      const createdAt = new Date(baseDate.getFullYear(), baseDate.getMonth(), Math.min(day, 27), 10 + i, 15, 0)
      const amountBRL = 20 + (i * 15) + Math.floor(Math.random() * 40) // random-ish
      const amountCents = amountBRL * 100

      await prisma.contribution.create({
        data: {
          projectId,
          contributorId: demoUserId,
          amountCents,
          currency: 'brl',
          status: 'SUCCEEDED',
          createdAt,
          updatedAt: createdAt,
        }
      })
    }
  }

  // Recalculate stats for the project
  const contribs = await prisma.contribution.findMany({ where: { projectId, status: 'SUCCEEDED' } })
  const raisedCents = contribs.reduce((sum, c) => sum + c.amountCents, 0)
  const uniqueSupporters = new Set(contribs.map(c => c.contributorId).filter(Boolean)).size
  await prisma.project.update({ where: { id: projectId }, data: { raisedCents, supportersCount: uniqueSupporters } })

  console.log('✅ Seed concluído com sucesso.')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


