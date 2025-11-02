import { http } from 'src/utils/http'

export const projectVideosService = {
  async uploadVideo(projectId: string, file: File) {
    const form = new FormData()
    form.append('video', file)
    const { data } = await http.post(`/api/projects/${projectId}/video`, form)
    return data as { message: string; videoUrl: string }
  },

  async deleteVideo(projectId: string) {
    await http.delete(`/api/projects/${projectId}/video`)
  }
}
