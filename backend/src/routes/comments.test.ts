import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'

// Mock do Prisma
const mockPrisma = prisma as any

describe('Comments API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/projects/:id/comments', () => {
    it('201 em sucesso com dados válidos', async () => {
      const fakeProject = {
        id: 'clr12345678901234567890123',
        title: 'Projeto Teste',
        deletedAt: null
      }

      const fakeComment = {
        id: 'clr98765432109876543210987',
        projectId: 'clr12345678901234567890123',
        authorId: 'user_test_id',
        content: 'Comentário de teste',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }

      mockPrisma.project.findUnique.mockResolvedValue(fakeProject)
      mockPrisma.user.upsert.mockResolvedValue({ id: 'user_test_id' })
      mockPrisma.comment.create.mockResolvedValue(fakeComment)

      const res = await request(app)
        .post('/api/projects/clr12345678901234567890123/comments')
        .set('Authorization', 'Bearer token_fake')
        .send({
          content: 'Comentário de teste'
        })
        .expect(201)

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'clr12345678901234567890123' }
      })
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user_test_id' },
        update: {},
        create: { id: 'user_test_id' }
      })
      expect(mockPrisma.comment.create).toHaveBeenCalledWith({
        data: {
          projectId: 'clr12345678901234567890123',
          authorId: 'user_test_id',
          content: 'Comentário de teste'
        }
      })
      expect(res.body).toEqual(fakeComment)
    })

    it('400 em parâmetros inválidos', async () => {
      const res = await request(app)
        .post('/api/projects/invalid-id/comments')
        .set('Authorization', 'Bearer token_fake')
        .send({
          content: 'Comentário de teste'
        })
        .expect(400)

      expect(res.body).toHaveProperty('error', 'ValidationError')
      expect(res.body).toHaveProperty('issues')
    })

    it('400 em body inválido', async () => {
      const res = await request(app)
        .post('/api/projects/clr12345678901234567890123/comments')
        .set('Authorization', 'Bearer token_fake')
        .send({
          content: '' // muito curto
        })
        .expect(400)

      expect(res.body).toHaveProperty('error', 'ValidationError')
      expect(res.body).toHaveProperty('issues')
    })

    it('404 quando projeto não existe', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null)

      const res = await request(app)
        .post('/api/projects/clr12345678901234567890123/comments')
        .set('Authorization', 'Bearer token_fake')
        .send({
          content: 'Comentário de teste'
        })
        .expect(404)

      expect(res.body).toHaveProperty('error', 'ProjectNotFound')
    })

    it('404 quando projeto foi deletado', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'clr12345678901234567890123',
        deletedAt: new Date()
      })

      const res = await request(app)
        .post('/api/projects/clr12345678901234567890123/comments')
        .set('Authorization', 'Bearer token_fake')
        .send({
          content: 'Comentário de teste'
        })
        .expect(404)

      expect(res.body).toHaveProperty('error', 'ProjectNotFound')
    })

    it('401 quando não autenticado', async () => {
      const res = await request(app)
        .post('/api/projects/clr12345678901234567890123/comments')
        .send({
          content: 'Comentário de teste'
        })
        .expect(401)

      expect(res.body).toHaveProperty('error', 'Unauthorized')
    })
  })

  describe('GET /api/projects/:id/comments', () => {
    it('retorna lista de comentários com paginação', async () => {
      const fakeComments = [
        {
          id: 'clr98765432109876543210987',
          projectId: 'clr12345678901234567890123',
          authorId: 'user_test_id',
          content: 'Comentário 1',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z'
        }
      ]

      mockPrisma.comment.findMany.mockResolvedValue(fakeComments)
      mockPrisma.comment.count.mockResolvedValue(1)

      const res = await request(app)
        .get('/api/projects/clr12345678901234567890123/comments')
        .query({ page: 1, pageSize: 10 })
        .expect(200)

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId: 'clr12345678901234567890123' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })
      expect(mockPrisma.comment.count).toHaveBeenCalledWith({
        where: { projectId: 'clr12345678901234567890123' }
      })
      expect(res.body).toHaveProperty('page', 1)
      expect(res.body).toHaveProperty('pageSize', 10)
      expect(res.body).toHaveProperty('total', 1)
      expect(res.body).toHaveProperty('items', fakeComments)
    })

    it('usa valores padrão para paginação', async () => {
      mockPrisma.comment.findMany.mockResolvedValue([])
      mockPrisma.comment.count.mockResolvedValue(0)

      await request(app)
        .get('/api/projects/clr12345678901234567890123/comments')
        .expect(200)

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId: 'clr12345678901234567890123' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })
    })

    it('limita pageSize máximo em 50', async () => {
      mockPrisma.comment.findMany.mockResolvedValue([])
      mockPrisma.comment.count.mockResolvedValue(0)

      await request(app)
        .get('/api/projects/clr12345678901234567890123/comments')
        .query({ pageSize: 100 })
        .expect(200)

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId: 'clr12345678901234567890123' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50
      })
    })

    it('400 em parâmetros inválidos', async () => {
      const res = await request(app)
        .get('/api/projects/invalid-id/comments')
        .expect(400)

      expect(res.body).toHaveProperty('error', 'ValidationError')
      expect(res.body).toHaveProperty('issues')
    })
  })

  describe('DELETE /api/comments/:commentId', () => {
    it('deleta comentário do autor', async () => {
      const fakeComment = {
        id: 'clr98765432109876543210987',
        authorId: 'user_test_id',
        project: {
          ownerId: 'other_user'
        }
      }

      mockPrisma.comment.findUnique.mockResolvedValue(fakeComment)
      mockPrisma.comment.delete.mockResolvedValue({})

      await request(app)
        .delete('/api/comments/clr98765432109876543210987')
        .set('Authorization', 'Bearer token_fake')
        .expect(204)

      expect(mockPrisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'clr98765432109876543210987' },
        include: { project: true }
      })
      expect(mockPrisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'clr98765432109876543210987' }
      })
    })

    it('deleta comentário do dono do projeto', async () => {
      const fakeComment = {
        id: 'clr98765432109876543210987',
        authorId: 'other_user',
        project: {
          ownerId: 'user_test_id'
        }
      }

      mockPrisma.comment.findUnique.mockResolvedValue(fakeComment)
      mockPrisma.comment.delete.mockResolvedValue({})

      await request(app)
        .delete('/api/comments/clr98765432109876543210987')
        .set('Authorization', 'Bearer token_fake')
        .expect(204)

      expect(mockPrisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'clr98765432109876543210987' }
      })
    })

    it('400 em parâmetros inválidos', async () => {
      const res = await request(app)
        .delete('/api/comments/invalid-id')
        .set('Authorization', 'Bearer token_fake')
        .expect(400)

      expect(res.body).toHaveProperty('error', 'ValidationError')
      expect(res.body).toHaveProperty('issues')
    })

    it('404 quando comentário não existe', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(null)

      const res = await request(app)
        .delete('/api/comments/clr98765432109876543210987')
        .set('Authorization', 'Bearer token_fake')
        .expect(404)

      expect(res.body).toHaveProperty('error', 'NotFound')
    })

    it('403 quando não é autor nem dono do projeto', async () => {
      const fakeComment = {
        id: 'clr98765432109876543210987',
        authorId: 'other_user',
        project: {
          ownerId: 'another_user'
        }
      }

      mockPrisma.comment.findUnique.mockResolvedValue(fakeComment)

      const res = await request(app)
        .delete('/api/comments/clr98765432109876543210987')
        .set('Authorization', 'Bearer token_fake')
        .expect(403)

      expect(res.body).toHaveProperty('error', 'Forbidden')
    })

    it('401 quando não autenticado', async () => {
      const res = await request(app)
        .delete('/api/comments/clr98765432109876543210987')
        .expect(401)

      expect(res.body).toHaveProperty('error', 'Unauthorized')
    })
  })
})
