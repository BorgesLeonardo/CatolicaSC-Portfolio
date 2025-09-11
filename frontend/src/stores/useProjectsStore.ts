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

  const owned = computed(() => 
    items.value.filter(project => !project.isCollaborator)
  )

  const collaborating = computed(() => 
    items.value.filter(project => project.isCollaborator)
  )

  const fetch = async (params?: { search?: string }) => {
    loading.value = true
    error.value = null

    try {
      const response = await http.get('/api/projects', { params })
      items.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar projetos'
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar projeto'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getById = async (id: number) => {
    try {
      const response = await http.get(`/api/projects/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar projeto'
      throw err
    }
  }

  return {
    items,
    loading,
    error,
    owned,
    collaborating,
    fetch,
    create,
    getById,
  }
})
