import { ref, computed } from 'vue'
import { projectsService } from 'src/services/projects'

const isUpdatingStats = ref(false)
const lastUpdateTime = ref<string | null>(null)
const updateError = ref<string | null>(null)

export function useProjectStats() {
  
  /**
   * Atualiza as estatísticas de todos os projetos
   * @param silent - Se true, não exibe logs no console
   */
  async function updateAllProjectStats(silent = false): Promise<boolean> {
    if (isUpdatingStats.value) {
      if (!silent) console.log('⏳ Atualização de estatísticas já em andamento...')
      return false
    }

    isUpdatingStats.value = true
    updateError.value = null

    try {
      if (!silent) console.log('🔄 Atualizando estatísticas dos projetos...')
      
      const result = await projectsService.updateAllStats()
      lastUpdateTime.value = result.timestamp
      
      if (!silent) {
        console.log('✅ Estatísticas atualizadas com sucesso!')
        console.log('📅 Última atualização:', new Date(result.timestamp).toLocaleString('pt-BR'))
      }
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      updateError.value = errorMessage
      
      if (!silent) {
        console.error('❌ Erro ao atualizar estatísticas:', errorMessage)
      }
      
      return false
    } finally {
      isUpdatingStats.value = false
    }
  }

  /**
   * Atualiza as estatísticas automaticamente quando necessário
   * Verifica se a última atualização foi há mais de 5 minutos
   */
  async function updateStatsIfNeeded(): Promise<boolean> {
    // Se já está atualizando, não faz nada
    if (isUpdatingStats.value) return false

    // Se nunca atualizou, atualiza
    if (!lastUpdateTime.value) {
      return await updateAllProjectStats(true)
    }

    // Verifica se a última atualização foi há mais de 5 minutos
    const lastUpdate = new Date(lastUpdateTime.value)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)

    if (diffMinutes > 5) {
      console.log('🔄 Atualizando estatísticas (última atualização há', Math.round(diffMinutes), 'minutos)')
      return await updateAllProjectStats(true)
    }

    return false
  }

  /**
   * Força uma atualização das estatísticas
   */
  async function forceUpdateStats(): Promise<boolean> {
    return await updateAllProjectStats(false)
  }

  return {
    isUpdatingStats: readonlyRef(isUpdatingStats),
    lastUpdateTime: readonlyRef(lastUpdateTime),
    updateError: readonlyRef(updateError),
    updateAllProjectStats,
    updateStatsIfNeeded,
    forceUpdateStats
  }
}

// Função readonly para tornar refs somente leitura
function readonlyRef<T>(ref: { value: T }) {
  return computed(() => ref.value)
}
