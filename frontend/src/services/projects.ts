import { http } from '../utils/http'

export interface ProjectImage {
  id: string
  projectId: string
  filename: string
  originalName: string
  url: string
  size: number
  mimeType: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  ownerId: string
  owner?: {
    id: string
    name?: string | null
  }
  categoryId?: string
  title: string
  description?: string
  goalCents: number
  fundingType?: 'DIRECT' | 'RECURRING'
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  deadline: string
  imageUrl?: string           // Mantido para compatibilidade
  images?: ProjectImage[]     // Novo sistema de imagens
  raisedCents?: number        // Valor arrecadado em centavos
  supportersCount?: number    // Número de apoiadores únicos
  subscriptionEnabled?: boolean
  subscriptionPriceCents?: number
  subscriptionInterval?: 'MONTH' | 'YEAR'
  createdAt: string
  updatedAt: string
  deletedAt?: string
  category?: {
    id: string
    name: string
    description?: string
    color?: string
    icon?: string
  }
}

export interface CreateProjectData {
  title: string
  description?: string
  fundingType: 'DIRECT' | 'RECURRING'
  goalCents?: number
  deadline: string
  imageUrl?: string
  categoryId: string
  subscriptionEnabled?: boolean
  subscriptionPriceCents?: number
  subscriptionInterval?: 'MONTH' | 'YEAR'
}

export interface UpdateProjectData {
  title?: string
  description?: string
  goalCents?: number
  deadline?: string
  imageUrl?: string
  categoryId?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  // Assinaturas (recorrente)
  subscriptionPriceCents?: number
  subscriptionInterval?: 'MONTH' | 'YEAR'
}

export interface ProjectFilters {
  q?: string
  ownerId?: string
  active?: boolean
  page?: number
  pageSize?: number
}

export interface ProjectsResponse {
  page: number
  pageSize: number
  total: number
  items: Project[]
}

export interface MyProjectsResponse {
  items: Project[]
}

export class ProjectsService {
  async create(data: CreateProjectData): Promise<Project> {
    const response = await http.post('/api/projects', data)
    return response.data
  }

  async list(filters: ProjectFilters = {}): Promise<ProjectsResponse> {
    const params = new URLSearchParams()
    
    if (filters.q) params.append('q', filters.q)
    if (filters.ownerId) params.append('ownerId', filters.ownerId)
    if (filters.active !== undefined) params.append('active', filters.active.toString())
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())

    const response = await http.get(`/api/projects?${params.toString()}`)
    return response.data
  }

  async getById(id: string): Promise<Project> {
    const response = await http.get(`/api/projects/${id}`)
    return response.data
  }

  async getMine(): Promise<MyProjectsResponse> {
    const response = await http.get('/api/projects/mine')
    return response.data
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const response = await http.patch(`/api/projects/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await http.delete(`/api/projects/${id}`)
  }

  async updateAllStats(): Promise<{ message: string; timestamp: string }> {
    const response = await http.post('/api/projects/update-stats')
    return response.data
  }
}

export const projectsService = new ProjectsService()
