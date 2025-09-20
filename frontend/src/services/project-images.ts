import { http } from 'src/utils/http'

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

export interface UploadImagesResponse {
  message: string
  images: ProjectImage[]
}

export interface GetImagesResponse {
  images: ProjectImage[]
}

export class ProjectImagesService {
  async uploadImages(projectId: string, files: File[], token: string): Promise<ProjectImage[]> {
    const formData = new FormData()
    
    files.forEach((file) => {
      formData.append('images', file)
    })

    const response = await http.post<UploadImagesResponse>(
      `/api/projects/${projectId}/images`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    return response.data.images
  }

  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    const response = await http.get<GetImagesResponse>(`/api/projects/${projectId}/images`)
    return response.data.images
  }

  async deleteImage(projectId: string, imageId: string, token: string): Promise<void> {
    await http.delete(`/api/projects/${projectId}/images/${imageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  async reorderImages(projectId: string, imageIds: string[], token: string): Promise<void> {
    await http.put(
      `/api/projects/${projectId}/images/reorder`,
      { imageIds },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
  }
}

export const projectImagesService = new ProjectImagesService()
