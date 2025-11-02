import { http } from '../utils/http'
import type { ProjectImage } from './projects'

export interface UploadImagesResponse {
  message: string
  images: ProjectImage[]
}

export interface ProjectImagesResponse {
  images: ProjectImage[]
}

export interface ReorderImagesData {
  imageIds: string[]
}

export class ProjectImagesService {
  async uploadImages(projectId: string, files: File[]): Promise<UploadImagesResponse> {
    const formData = new FormData()
    
    files.forEach((file) => {
      formData.append('images', file)
    })
    
    const response = await http.post(`/api/projects/${projectId}/images`, formData, {
      // Let Axios set the proper multipart boundary automatically
      timeout: 60000
    })
    
    return response.data
  }

  async getProjectImages(projectId: string): Promise<ProjectImagesResponse> {
    const response = await http.get(`/api/projects/${projectId}/images`)
    return response.data
  }

  async deleteImage(projectId: string, imageId: string): Promise<void> {
    await http.delete(`/api/projects/${projectId}/images/${imageId}`)
  }

  async reorderImages(projectId: string, imageIds: string[]): Promise<{ message: string }> {
    const response = await http.put(`/api/projects/${projectId}/images/reorder`, { imageIds })
    return response.data
  }
}

export const projectImagesService = new ProjectImagesService()