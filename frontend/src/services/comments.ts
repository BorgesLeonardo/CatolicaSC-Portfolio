import { http } from '../utils/http'

export interface Comment {
  id: string
  projectId: string
  authorId: string
  content: string
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    name?: string
    email?: string
  }
}

export interface CreateCommentData {
  content: string
}

export interface CommentsResponse {
  page: number
  pageSize: number
  total: number
  items: Comment[]
}

export class CommentsService {
  async create(projectId: string, data: CreateCommentData): Promise<Comment> {
    const response = await http.post(`/api/projects/${projectId}/comments`, data)
    return response.data
  }

  async listByProject(projectId: string, page: number = 1, pageSize: number = 10): Promise<CommentsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    })

    const response = await http.get(`/api/projects/${projectId}/comments?${params.toString()}`)
    return response.data
  }

  async delete(commentId: string): Promise<void> {
    await http.delete(`/api/comments/${commentId}`)
  }
}

export const commentsService = new CommentsService()
