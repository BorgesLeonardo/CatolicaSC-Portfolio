import { sql } from './index'

// Exemplos de uso do postgres para consultas diretas
export class DatabaseExamples {
  // Exemplo: Buscar todas as campanhas ativas
  static async getActiveCampaigns() {
    try {
      const campaigns = await sql`
        SELECT 
          c.*,
          u.name as user_name,
          cat.name as category_name
        FROM campaigns c
        JOIN users u ON c.user_id = u.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.status = 'ACTIVE'
        ORDER BY c.created_at DESC
      `
      return campaigns
    } catch (error) {
      console.error('Erro ao buscar campanhas ativas:', error)
      throw error
    }
  }

  // Exemplo: Buscar estatísticas de uma campanha
  static async getCampaignStats(campaignId: string) {
    try {
      const stats = await sql`
        SELECT 
          c.title,
          c.goal,
          c.current,
          COUNT(contrib.id) as total_contributions,
          COALESCE(SUM(contrib.amount), 0) as total_raised,
          COALESCE(AVG(contrib.amount), 0) as average_contribution
        FROM campaigns c
        LEFT JOIN contributions contrib ON c.id = contrib.campaign_id 
          AND contrib.status = 'COMPLETED'
        WHERE c.id = ${campaignId}
        GROUP BY c.id, c.title, c.goal, c.current
      `
      return stats[0] || null
    } catch (error) {
      console.error('Erro ao buscar estatísticas da campanha:', error)
      throw error
    }
  }

  // Exemplo: Buscar contribuições recentes
  static async getRecentContributions(limit: number = 10) {
    try {
      const contributions = await sql`
        SELECT 
          contrib.*,
          c.title as campaign_title,
          u.name as contributor_name
        FROM contributions contrib
        JOIN campaigns c ON contrib.campaign_id = c.id
        LEFT JOIN users u ON contrib.user_id = u.id
        WHERE contrib.status = 'COMPLETED'
        ORDER BY contrib.created_at DESC
        LIMIT ${limit}
      `
      return contributions
    } catch (error) {
      console.error('Erro ao buscar contribuições recentes:', error)
      throw error
    }
  }

  // Exemplo: Buscar campanhas por categoria
  static async getCampaignsByCategory(categoryId: string) {
    try {
      const campaigns = await sql`
        SELECT 
          c.*,
          u.name as user_name,
          cat.name as category_name,
          COUNT(contrib.id) as contribution_count,
          COALESCE(SUM(contrib.amount), 0) as total_raised
        FROM campaigns c
        JOIN users u ON c.user_id = u.id
        JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN contributions contrib ON c.id = contrib.campaign_id 
          AND contrib.status = 'COMPLETED'
        WHERE c.category_id = ${categoryId}
        GROUP BY c.id, u.name, cat.name
        ORDER BY c.created_at DESC
      `
      return campaigns
    } catch (error) {
      console.error('Erro ao buscar campanhas por categoria:', error)
      throw error
    }
  }

  // Exemplo: Atualizar progresso de uma campanha
  static async updateCampaignProgress(campaignId: string) {
    try {
      const result = await sql`
        UPDATE campaigns 
        SET current = (
          SELECT COALESCE(SUM(amount), 0)
          FROM contributions 
          WHERE campaign_id = ${campaignId} 
            AND status = 'COMPLETED'
        ),
        updated_at = NOW()
        WHERE id = ${campaignId}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error('Erro ao atualizar progresso da campanha:', error)
      throw error
    }
  }

  // Exemplo: Buscar usuários mais ativos
  static async getTopContributors(limit: number = 10) {
    try {
      const contributors = await sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(contrib.id) as total_contributions,
          COALESCE(SUM(contrib.amount), 0) as total_donated
        FROM users u
        JOIN contributions contrib ON u.id = contrib.user_id
        WHERE contrib.status = 'COMPLETED'
        GROUP BY u.id, u.name, u.email
        ORDER BY total_donated DESC
        LIMIT ${limit}
      `
      return contributors
    } catch (error) {
      console.error('Erro ao buscar top contribuidores:', error)
      throw error
    }
  }
}
