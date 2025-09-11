import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '../services/http'

export interface ProjectDTO {
  id: number
  name: string
  ownerId: number
  ownerName?: string
  description?: string
  imageUrl?: string
  goal?: number
  raised?: number
  supporters?: number
  endsAt?: string
  isCollaborator?: boolean
}

export const useProjectsStore = defineStore('projects', () => {
  const items = ref<ProjectDTO[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Ensure items is always an array
  const safeItems = computed(() => Array.isArray(items.value) ? items.value : [])

  const owned = computed(() => 
    safeItems.value.filter(project => !project.isCollaborator)
  )

  const collaborating = computed(() => 
    safeItems.value.filter(project => project.isCollaborator)
  )

  const fetch = async (params?: { search?: string }) => {
    loading.value = true
    error.value = null

    try {
      const response = await http.get('/api/projects', { params })
      items.value = response.data
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? (typeof err.response.data.message === 'string' ? err.response.data.message : JSON.stringify(err.response.data.message))
        : 'Erro ao carregar projetos'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const create = async (projectData: Partial<ProjectDTO>) => {
    loading.value = true
    error.value = null

    try {
      const response = await http.post('/api/projects', projectData)
      items.value.unshift(response.data)
      return response.data
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? (typeof err.response.data.message === 'string' ? err.response.data.message : JSON.stringify(err.response.data.message))
        : 'Erro ao criar projeto'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const getById = async (id: number) => {
    try {
      const response = await http.get(`/api/projects/${id}`)
      return response.data
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? (typeof err.response.data.message === 'string' ? err.response.data.message : JSON.stringify(err.response.data.message))
        : 'Erro ao carregar projeto'
      error.value = errorMessage
      throw err
    }
  }

  return {
    items: safeItems,
    loading,
    error,
    owned,
    collaborating,
    fetch,
    create,
    getById,
  }
})
