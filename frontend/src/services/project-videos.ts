import { http } from 'src/utils/http'

export interface PresignResponse {
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

export const projectVideosService = {
  async presign(projectId: string, file: File) {
    try {
      const { data } = await http.post(`/api/projects/${projectId}/video/presign`, {
        filename: file.name,
        contentType: file.type,
        size: file.size
      })
      return data as PresignResponse
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } } | undefined)?.response?.status
      if (status === 501) return null
      throw err as Error
    }
  },

  async uploadVideo(projectId: string, file: File, onProgress?: (p: number) => void) {
    // Try presigned first
    const presigned = await this.presign(projectId, file)
    if (presigned) {
      await xhrPut(presigned.uploadUrl, file, file.type || 'application/octet-stream', onProgress)
      await http.post(`/api/projects/${projectId}/video/finalize`, { publicUrl: presigned.publicUrl })
      return { message: 'Video uploaded successfully', videoUrl: presigned.publicUrl }
    }

    // Fallback to API upload
    const form = new FormData()
    form.append('video', file)
    const { data } = await http.post(`/api/projects/${projectId}/video`, form)
    return data as { message: string; videoUrl: string }
  },

  async deleteVideo(projectId: string) {
    await http.delete(`/api/projects/${projectId}/video`)
  }
}
