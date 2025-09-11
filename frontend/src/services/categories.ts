import { http } from '../utils/http'
import type { Category } from '../components/models'

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const response = await http.get('/api/categories')
    return response.data
  },

  async getById(id: string): Promise<Category> {
    const response = await http.get(`/api/categories/${id}`)
    return response.data
  }
}
