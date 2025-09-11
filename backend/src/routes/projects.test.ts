import request from 'supertest'
import app from '../app'

// Mock the prisma module
jest.mock('../infrastructure/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    contribution: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

// Get the mocked prisma instance
const { prisma: mockPrisma } = require('../infrastructure/prisma');

describe('Projects API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/projects', () => {
    it('201 em sucesso com body válido e Bearer token', async () => {
      const fakeProject = {
        id: 'clr12345678901234567890123',
        ownerId: 'user_test_id',
        title: 'Nova Campanha',
        description: 'Descrição da campanha',
        goalCents: 100000,
        deadline: '2025-12-31T23:59:59.000Z',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        deletedAt: null
      }

      mockPrisma.user.upsert.mockResolvedValue({ id: 'user_test_id' })
      mockPrisma.project.create.mockResolvedValue(fakeProject)

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer token_fake')
        .send({
          title: 'Nova Campanha',
          description: 'Descrição da campanha',
          goalCents: 100000,
          deadline: '2025-12-31T23:59:59Z',
          imageUrl: 'https://example.com/image.jpg'
        })
        .expect(201)

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user_test_id' },
        update: {},
        create: { id: 'user_test_id' }
      })
      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          ownerId: 'user_test_id',
          title: 'Nova Campanha',
          description: 'Descrição da campanha',
          goalCents: 100000,
          deadline: expect.any(Date),
          imageUrl: 'https://example.com/image.jpg'
        }
      })
      expect(res.body).toEqual(fakeProject)
    })

    it('400 em payload inválido', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer token_fake')
        .send({
          title: 'A', // muito curto
          goalCents: -100 // negativo
        })
        .expect(400)

      expect(res.body).toHaveProperty('error', 'ValidationError')
      expect(res.body).toHaveProperty('details')
    })

    it('401 quando sem Authorization', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('x-test-auth-bypass', 'false')
        .send({
          title: 'Nova Campanha',
          goalCents: 100000,
          deadline: '2025-12-31T23:59:59Z'
        })
        .expect(401)

      expect(res.body).toHaveProperty('error', 'Unauthorized')
    })
  })

  describe('GET /api/projects', () => {
    it('retorna lista de projetos com paginação', async () => {
      const fakeProjects = [
        {
          id: 'clr12345678901234567890123',
          title: 'Campanha 1',
          goalCents: 50000,
          deadline: '2025-12-31T23:59:59.000Z',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          deletedAt: null
        }
      ]

      mockPrisma.project.findMany.mockResolvedValue(fakeProjects)
      mockPrisma.project.count.mockResolvedValue(1)

      const res = await request(app)
        .get('/api/projects')
        .query({ page: 1, pageSize: 10 })
        .expect(200)

      expect(res.body).toHaveProperty('page', 1)
      expect(res.body).toHaveProperty('pageSize', 10)
      expect(res.body).toHaveProperty('total', 1)
      expect(res.body).toHaveProperty('items', fakeProjects)
    })

    it('filtra por busca de título', async () => {
      mockPrisma.project.findMany.mockResolvedValue([])
      mockPrisma.project.count.mockResolvedValue(0)

      await request(app)
        .get('/api/projects')
        .query({ q: 'teste' })
        .expect(200)

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          title: { contains: 'teste', mode: 'insensitive' }
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })
    })

    it('filtra por ownerId', async () => {
      mockPrisma.project.findMany.mockResolvedValue([])
      mockPrisma.project.count.mockResolvedValue(0)

      await request(app)
        .get('/api/projects')
        .query({ ownerId: 'user_123' })
        .expect(200)

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          ownerId: 'user_123'
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })
    })

    it('filtra por projetos ativos', async () => {
      mockPrisma.project.findMany.mockResolvedValue([])
      mockPrisma.project.count.mockResolvedValue(0)

      await request(app)
        .get('/api/projects')
        .query({ active: 'true' })
        .expect(200)

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          deadline: { gte: expect.any(Date) }
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })
    })
  })

  describe('GET /api/projects/mine', () => {
    it('retorna projetos do usuário autenticado', async () => {
      const fakeProjects = [
        {
          id: 'clr12345678901234567890123',
          title: 'Minha Campanha',
          ownerId: 'user_test_id',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          deletedAt: null
        }
      ]

      mockPrisma.project.findMany.mockResolvedValue(fakeProjects)

      const res = await request(app)
        .get('/api/projects/mine')
        .set('Authorization', 'Bearer token_fake')
        .expect(200)

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user_test_id', deletedAt: null },
        orderBy: { createdAt: 'desc' }
      })
      expect(res.body).toHaveProperty('items', fakeProjects)
    })

    it('401 quando não autenticado', async () => {
      const res = await request(app)
        .get('/api/projects/mine')
        .set('x-test-auth-bypass', 'false')
        .expect(401)

      expect(res.body).toHaveProperty('error', 'Unauthorized')
    })
  })

  describe('GET /api/projects/:id', () => {
    it('retorna projeto por ID', async () => {
      const fakeProject = {
        id: 'clr12345678901234567890123',
        title: 'Campanha Teste',
        goalCents: 100000,
        deadline: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        deletedAt: null
      }

      mockPrisma.project.findUnique.mockResolvedValue(fakeProject)

      const res = await request(app)
        .get('/api/projects/clr12345678901234567890123')
        .expect(200)

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'clr12345678901234567890123' }
      })
      expect(res.body).toEqual(fakeProject)
    })

    it('404 quando projeto não existe', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null)

      const res = await request(app)
        .get('/api/projects/clr12345678901234567890123')
        .expect(404)

      expect(res.body).toHaveProperty('error', 'Project not found')
    })

    it('404 quando projeto foi deletado', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'clr12345678901234567890123',
        deletedAt: new Date()
      })

      const res = await request(app)
        .get('/api/projects/clr12345678901234567890123')
        .expect(404)

      expect(res.body).toHaveProperty('error', 'Project not found')
    })

    it('400 quando ID inválido', async () => {
      const res = await request(app)
        .get('/api/projects/invalid-id')
        .expect(400)

      expect(res.body).toHaveProperty('error', 'ValidationError')
    })
  })

  describe('PATCH /api/projects/:id', () => {
    it('atualiza projeto do dono', async () => {
      const fakeProject = {
        id: 'clr12345678901234567890123',
        ownerId: 'user_test_id',
        title: 'Campanha Atualizada',
        goalCents: 150000,
        deadline: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        deletedAt: null
      }

      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'clr12345678901234567890123',
        ownerId: 'user_test_id',
        deletedAt: null
      })
      mockPrisma.project.update.mockResolvedValue(fakeProject)

      const res = await request(app)
        .patch('/api/projects/clr12345678901234567890123')
        .set('Authorization', 'Bearer token_fake')
        .send({
          title: 'Campanha Atualizada',
          goalCents: 150000
        })
        .expect(200)

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'clr12345678901234567890123' },
        data: {
          title: 'Campanha Atualizada',
          goalCents: 150000
        }
      })
      expect(res.body).toEqual(fakeProject)
    })

    it('403 quando não é o dono', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'clr12345678901234567890123',
        ownerId: 'other_user',
        deletedAt: null
      })

      const res = await request(app)
        .patch('/api/projects/clr12345678901234567890123')
        .set('Authorization', 'Bearer token_fake')
        .send({ title: 'Tentativa de Edição' })
        .expect(403)

      expect(res.body).toHaveProperty('error', 'Forbidden')
    })

    it('404 quando projeto não existe', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null)

      const res = await request(app)
        .patch('/api/projects/clr12345678901234567890123')
        .set('Authorization', 'Bearer token_fake')
        .send({ title: 'Tentativa de Edição' })
        .expect(404)

      expect(res.body).toHaveProperty('error', 'Project not found')
    })
  })

  describe('DELETE /api/projects/:id', () => {
    it('deleta projeto do dono (soft delete)', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'clr12345678901234567890123',
        ownerId: 'user_test_id',
        deletedAt: null
      })
      mockPrisma.project.update.mockResolvedValue({})

      await request(app)
        .delete('/api/projects/clr12345678901234567890123')
        .set('Authorization', 'Bearer token_fake')
        .expect(204)

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'clr12345678901234567890123' },
        data: { deletedAt: expect.any(Date) }
      })
    })

    it('403 quando não é o dono', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'clr12345678901234567890123',
        ownerId: 'other_user',
        deletedAt: null
      })

      const res = await request(app)
        .delete('/api/projects/clr12345678901234567890123')
        .set('Authorization', 'Bearer token_fake')
        .expect(403)

      expect(res.body).toHaveProperty('error', 'Forbidden')
    })

    it('404 quando projeto não existe', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null)

      const res = await request(app)
        .delete('/api/projects/clr12345678901234567890123')
        .set('Authorization', 'Bearer token_fake')
        .expect(404)

      expect(res.body).toHaveProperty('error', 'Project not found')
    })

    it('404 quando projeto foi deletado', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'clr12345678901234567890123',
        ownerId: 'user_test_id',
        deletedAt: new Date()
      })

      const res = await request(app)
        .delete('/api/projects/clr12345678901234567890123')
        .set('Authorization', 'Bearer token_fake')
        .expect(404)

      expect(res.body).toHaveProperty('error', 'Project not found')
    })

    it('400 quando ID inválido', async () => {
      const res = await request(app)
        .delete('/api/projects/invalid-id')
        .set('Authorization', 'Bearer token_fake')
        .expect(400)

      expect(res.body).toHaveProperty('error', 'ValidationError')
    })

    it('401 quando não autenticado', async () => {
      const res = await request(app)
        .delete('/api/projects/clr12345678901234567890123')
        .set('x-test-auth-bypass', 'false')
        .expect(401)

      expect(res.body).toHaveProperty('error', 'Unauthorized')
    })
  })

  describe('PATCH /api/projects/:id - additional scenarios', () => {
    it('400 em body vazio', async () => {
      const res = await request(app)
        .patch('/api/projects/clr12345678901234567890123')
        .set('Authorization', 'Bearer token_fake')
        .send({})
        .expect(400)

      expect(res.body).toHaveProperty('error', 'ValidationError')
    })

    it('atualiza com deadline convertida para Date', async () => {
      const fakeProject = {
        id: 'clr12345678901234567890123',
        ownerId: 'user_test_id',
        title: 'Campanha Atualizada',
        deadline: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        deletedAt: null
      }

      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'clr12345678901234567890123',
        ownerId: 'user_test_id',
        deletedAt: null
      })
      mockPrisma.project.update.mockResolvedValue(fakeProject)

      await request(app)
        .patch('/api/projects/clr12345678901234567890123')
        .set('Authorization', 'Bearer token_fake')
        .send({
          deadline: '2025-12-31T23:59:59Z'
        })
        .expect(200)

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'clr12345678901234567890123' },
        data: {
          deadline: expect.any(Date)
        }
      })
    })

    it('500 em erro interno', async () => {
      mockPrisma.project.findUnique.mockRejectedValue(new Error('Database error'))

      const res = await request(app)
        .patch('/api/projects/clr12345678901234567890123')
        .set('Authorization', 'Bearer token_fake')
        .send({ title: 'Teste' })
        .expect(500)

      expect(res.body).toHaveProperty('error', 'InternalError')
    })
  })

  describe('GET /api/projects - additional scenarios', () => {
    it('filtra por active=1', async () => {
      mockPrisma.project.findMany.mockResolvedValue([])
      mockPrisma.project.count.mockResolvedValue(0)

      await request(app)
        .get('/api/projects')
        .query({ active: '1' })
        .expect(200)

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          deadline: { gte: expect.any(Date) }
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })
    })

    it('filtra por active=true', async () => {
      mockPrisma.project.findMany.mockResolvedValue([])
      mockPrisma.project.count.mockResolvedValue(0)

      await request(app)
        .get('/api/projects')
        .query({ active: 'true' })
        .expect(200)

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          deadline: { gte: expect.any(Date) }
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })
    })

    it('ignora active quando não é 1 ou true', async () => {
      mockPrisma.project.findMany.mockResolvedValue([])
      mockPrisma.project.count.mockResolvedValue(0)

      await request(app)
        .get('/api/projects')
        .query({ active: 'false' })
        .expect(200)

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })
    })

    it('aplica page mínimo de 1', async () => {
      mockPrisma.project.findMany.mockResolvedValue([])
      mockPrisma.project.count.mockResolvedValue(0)

      await request(app)
        .get('/api/projects')
        .query({ page: 0 })
        .expect(200)

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })
    })

    it('aplica pageSize mínimo de 1', async () => {
      mockPrisma.project.findMany.mockResolvedValue([])
      mockPrisma.project.count.mockResolvedValue(0)

      await request(app)
        .get('/api/projects')
        .query({ pageSize: 0 })
        .expect(200)

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 1
      })
    })
  })
})
