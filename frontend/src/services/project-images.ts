import { http } from '../utils/http'
import type { ProjectImage } from './projects'

interface PresignItem {
  uploadUrl: string
  key: string
  publicUrl: string
}

function xhrPut(url: string, file: File, contentType: string, onProgress?: (percent: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.upload.onprogress = (evt) => {
      if (!onProgress) return
      if (evt.lengthComputable) {
        const p = Math.round((evt.loaded / evt.total) * 100)
        onProgress(p)
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed with ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(file)
  })
}

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
  async uploadImages(projectId: string, files: File[], token?: string, onProgress?: (p: number) => void): Promise<UploadImagesResponse> {
    // Try presign flow first
    try {
      const { data } = await http.post(`/api/projects/${projectId}/images/presign`, {
        files: files.map(f => ({ filename: f.name, contentType: f.type, size: f.size }))
      })
      const items = (data?.items || []) as PresignItem[]
      if (items.length === files.length && items.length > 0) {
        // Upload in parallel
        const progressPerFile = new Array(files.length).fill(0)
        const updateOverall = () => {
          if (!onProgress) return
          const total = Math.round(progressPerFile.reduce((a, b) => a + b, 0) / files.length)
          onProgress(total)
        }
        await Promise.all(items.map((it, idx) => xhrPut(it.uploadUrl, files[idx], files[idx].type || 'application/octet-stream', (p) => {
          progressPerFile[idx] = p
          updateOverall()
        })))
        const finalizePayload = {
          images: items.map((it, idx) => ({
            publicUrl: it.publicUrl,
            originalName: files[idx].name,
            size: files[idx].size,
            mimeType: files[idx].type || 'application/octet-stream'
          }))
        }
        const resp = await http.post(`/api/projects/${projectId}/images/finalize`, finalizePayload)
        return resp.data as UploadImagesResponse
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } } | undefined)?.response?.status
      if (status !== 501) {
        // If it's not the feature-disabled case, rethrow to avoid silent failures
        // and let fallback handle only when presign is disabled
      }
    }

    // Fallback to multipart
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
    })
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data'
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const response = await http.post(`/api/projects/${projectId}/images`, formData, { headers })
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