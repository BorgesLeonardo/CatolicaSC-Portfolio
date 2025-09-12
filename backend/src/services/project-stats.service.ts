import { prisma } from '../infrastructure/prisma'

export class ProjectStatsService {
  /**
   * Recalcula e atualiza as estatísticas de um projeto específico
   * baseado nas contribuições com status SUCCEEDED
   */
  async updateProjectStats(projectId: string): Promise<{
    raisedCents: number
    supportersCount: number
  }> {
    // Buscar todas as contribuições bem-sucedidas do projeto
    const contributions = await prisma.contribution.findMany({
      where: {
        projectId,
        status: 'SUCCEEDED'
      }
    })

    // Calcular valor total arrecadado
    const raisedCents = contributions.reduce((sum, contrib) => sum + contrib.amountCents, 0)
    
    // Calcular número de apoiadores únicos
    const uniqueContributors = new Set(
      contributions.map(contrib => contrib.contributorId).filter(Boolean)
    )
    const supportersCount = uniqueContributors.size

    // Atualizar o projeto no banco
    await prisma.project.update({
      where: { id: projectId },
      data: {
        raisedCents,
        supportersCount
      }
    })

    return { raisedCents, supportersCount }
  }

  /**
   * Recalcula as estatísticas de todos os projetos de forma eficiente
   */
  async updateAllProjectsStats(): Promise<void> {
    console.log('📊 Iniciando atualização em lote das estatísticas...')
    
    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true }
    })

    console.log(`🔍 Encontrados ${projects.length} projetos para atualizar`)

    // Processar projetos em lotes para melhor performance
    const batchSize = 5
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize)
      
      const promises = batch.map(async (project) => {
        try {
          const stats = await this.updateProjectStats(project.id)
          console.log(`✅ ${project.title}: R$ ${(stats.raisedCents / 100).toFixed(2)} - ${stats.supportersCount} apoiadores`)
          return stats
        } catch (error) {
          console.error(`❌ Erro ao atualizar ${project.title}:`, error)
          return null
        }
      })

      await Promise.all(promises)
    }

    console.log('🎉 Atualização em lote concluída!')
  }

  /**
   * Verifica se as estatísticas de um projeto estão corretas
   */
  async validateProjectStats(projectId: string): Promise<{
    isValid: boolean
    currentStats: { raisedCents: number; supportersCount: number }
    correctStats: { raisedCents: number; supportersCount: number }
  }> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { raisedCents: true, supportersCount: true }
    })

    if (!project) {
      throw new Error('Project not found')
    }

    const contributions = await prisma.contribution.findMany({
      where: {
        projectId,
        status: 'SUCCEEDED'
      }
    })

    const correctRaisedCents = contributions.reduce((sum, contrib) => sum + contrib.amountCents, 0)
    const uniqueContributors = new Set(
      contributions.map(contrib => contrib.contributorId).filter(Boolean)
    )
    const correctSupportersCount = uniqueContributors.size

    return {
      isValid: project.raisedCents === correctRaisedCents && project.supportersCount === correctSupportersCount,
      currentStats: {
        raisedCents: project.raisedCents,
        supportersCount: project.supportersCount
      },
      correctStats: {
        raisedCents: correctRaisedCents,
        supportersCount: correctSupportersCount
      }
    }
  }
}

export const projectStatsService = new ProjectStatsService()
