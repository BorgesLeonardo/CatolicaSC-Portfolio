import request from 'supertest';
import app from '../../app';
import { prisma } from '../../infrastructure/prisma';

describe('Projects Integration Tests', () => {
  const testUser = `test-user-${Date.now()}`;
  const testCategory = {
    id: `test-cat-${Date.now()}`,
    name: `Technology-${Date.now()}`,
    description: 'Tech projects',
    color: '#FF0000',
    icon: 'tech-icon',
    isActive: true
  };

  beforeEach(async () => {
    // Clean database
    try {
      await prisma.contribution.deleteMany();
      await prisma.comment.deleteMany();
      await prisma.project.deleteMany();
      await prisma.category.deleteMany();
      await prisma.user.deleteMany();
    } catch (error) {
      // Ignorar erros de limpeza
    }

    // Create test data
    await prisma.user.create({ data: { id: testUser } });
    await prisma.category.create({ data: testCategory });
  });

  describe('GET /api/projects', () => {
    it('should list projects publicly', async () => {
      // Create test project
      const project = await prisma.project.create({
        data: {
          id: 'test-proj-1',
          title: 'Test Project',
          description: 'A test project description',
          goalCents: 10000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: testUser,
          categoryId: testCategory.id
        }
      });

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pageSize');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.total).toBe(1);
      expect(response.body.items[0]).toMatchObject({
        id: project.id,
        title: project.title,
        description: project.description
      });
    });

    it('should filter projects by search query', async () => {
      // Create test projects
      await prisma.project.create({
        data: {
          id: 'test-proj-1',
          title: 'Technology Project',
          description: 'A tech project',
          goalCents: 10000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: testUser,
          categoryId: testCategory.id
        }
      });

      await prisma.project.create({
        data: {
          id: 'test-proj-2',
          title: 'Art Project',
          description: 'An art project',
          goalCents: 5000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: testUser,
          categoryId: testCategory.id
        }
      });

      const response = await request(app)
        .get('/api/projects?q=Technology')
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.items[0].title).toBe('Technology Project');
    });

    it('should filter projects by category', async () => {
      // Create another category
      const artCategory = await prisma.category.create({
        data: {
          id: 'test-cat-2',
          name: 'Art',
          description: 'Art projects',
          color: '#00FF00',
          icon: 'art-icon',
          isActive: true
        }
      });

      // Create projects in different categories
      await prisma.project.create({
        data: {
          id: 'test-proj-1',
          title: 'Tech Project',
          description: 'A tech project',
          goalCents: 10000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: testUser,
          categoryId: testCategory.id
        }
      });

      await prisma.project.create({
        data: {
          id: 'test-proj-2',
          title: 'Art Project',
          description: 'An art project',
          goalCents: 5000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: testUser,
          categoryId: artCategory.id
        }
      });

      const response = await request(app)
        .get(`/api/projects?categoryId=${testCategory.id}`)
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.items[0].title).toBe('Tech Project');
    });

    it('should filter active projects', async () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday

      // Create active project (future deadline)
      await prisma.project.create({
        data: {
          id: 'test-proj-1',
          title: 'Active Project',
          description: 'An active project',
          goalCents: 10000,
          deadline: futureDate,
          ownerId: testUser,
          categoryId: testCategory.id
        }
      });

      // Create inactive project (past deadline)
      await prisma.project.create({
        data: {
          id: 'test-proj-2',
          title: 'Inactive Project',
          description: 'An inactive project',
          goalCents: 5000,
          deadline: pastDate,
          ownerId: testUser,
          categoryId: testCategory.id
        }
      });

      const response = await request(app)
        .get('/api/projects?active=true')
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.items[0].title).toBe('Active Project');
    });

    it('should handle pagination', async () => {
      // Create multiple projects
      for (let i = 1; i <= 15; i++) {
        await prisma.project.create({
          data: {
            id: `test-proj-${i}`,
            title: `Project ${i}`,
            description: `Description ${i}`,
            goalCents: 10000,
            deadline: new Date('2024-12-31T23:59:59Z'),
            ownerId: testUser,
            categoryId: testCategory.id
          }
        });
      }

      const response = await request(app)
        .get('/api/projects?page=2&pageSize=5')
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.pageSize).toBe(5);
      expect(response.body.total).toBe(15);
      expect(response.body.items).toHaveLength(5);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should get project by id', async () => {
      const project = await prisma.project.create({
        data: {
          id: 'test-proj-1',
          title: 'Test Project',
          description: 'A test project description',
          goalCents: 10000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: testUser,
          categoryId: testCategory.id
        }
      });

      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: project.id,
        title: project.title,
        description: project.description,
        goalCents: project.goalCents
      });
      expect(response.body).toHaveProperty('category');
    });

    it('should return 404 for non-existent project', async () => {
      await request(app)
        .get('/api/projects/non-existent-id')
        .expect(404);
    });

    it('should return 400 for invalid id format', async () => {
      await request(app)
        .get('/api/projects/invalid-id')
        .expect(400);
    });
  });

  describe('POST /api/projects', () => {
    it('should create project with authentication', async () => {
      const projectData = {
        title: 'New Project',
        description: 'A new project description',
        goalCents: 15000,
        deadline: '2024-12-31T23:59:59Z',
        imageUrl: 'https://example.com/image.jpg',
        categoryId: testCategory.id
      };

      const response = await request(app)
        .post('/api/projects')
        .set('x-test-user-id', testUser)
        .send(projectData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: projectData.title,
        description: projectData.description,
        goalCents: projectData.goalCents,
        imageUrl: projectData.imageUrl
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 401 without authentication', async () => {
      const projectData = {
        title: 'New Project',
        description: 'A new project description',
        goalCents: 15000,
        deadline: '2024-12-31T23:59:59Z',
        categoryId: testCategory.id
      };

      await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: 'A', // Too short
        description: 'Short', // Too short
        goalCents: -100, // Negative
        deadline: 'invalid-date',
        categoryId: 'invalid-category'
      };

      await request(app)
        .post('/api/projects')
        .set('x-test-user-id', testUser)
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for non-existent category', async () => {
      const projectData = {
        title: 'New Project',
        description: 'A new project description',
        goalCents: 15000,
        deadline: '2024-12-31T23:59:59Z',
        categoryId: 'non-existent-category'
      };

      await request(app)
        .post('/api/projects')
        .set('x-test-user-id', testUser)
        .send(projectData)
        .expect(400);
    });
  });

  describe('GET /api/projects/mine', () => {
    it('should get user projects with authentication', async () => {
      // Create projects for different users
      const otherUser = 'other-user-123';
      await prisma.user.create({ data: { id: otherUser } });

      await prisma.project.create({
        data: {
          id: 'test-proj-1',
          title: 'My Project',
          description: 'My project description',
          goalCents: 10000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: testUser,
          categoryId: testCategory.id
        }
      });

      await prisma.project.create({
        data: {
          id: 'test-proj-2',
          title: 'Other Project',
          description: 'Other project description',
          goalCents: 5000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: otherUser,
          categoryId: testCategory.id
        }
      });

      const response = await request(app)
        .get('/api/projects/mine')
        .set('x-test-user-id', testUser)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toBe('My Project');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/projects/mine')
        .expect(401);
    });
  });

  describe('PATCH /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await prisma.project.create({
        data: {
          id: 'test-proj-1',
          title: 'Original Project',
          description: 'Original description',
          goalCents: 10000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: testUser,
          categoryId: testCategory.id
        }
      });
      projectId = project.id;
    });

    it('should update project with authentication', async () => {
      const updateData = {
        title: 'Updated Project',
        description: 'Updated description'
      };

      const response = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('x-test-user-id', testUser)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: projectId,
        title: updateData.title,
        description: updateData.description
      });
    });

    it('should return 401 without authentication', async () => {
      const updateData = {
        title: 'Updated Project'
      };

      await request(app)
        .patch(`/api/projects/${projectId}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 403 for non-owner', async () => {
      const otherUser = 'other-user-123';
      await prisma.user.create({ data: { id: otherUser } });

      const updateData = {
        title: 'Updated Project'
      };

      await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('x-test-user-id', otherUser)
        .send(updateData)
        .expect(403);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: 'A' // Too short
      };

      await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('x-test-user-id', testUser)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await prisma.project.create({
        data: {
          id: 'test-proj-1',
          title: 'Project to Delete',
          description: 'This project will be deleted',
          goalCents: 10000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: testUser,
          categoryId: testCategory.id
        }
      });
      projectId = project.id;
    });

    it('should soft delete project with authentication', async () => {
      await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('x-test-user-id', testUser)
        .expect(204);

      // Verify project is soft deleted
      const deletedProject = await prisma.project.findUnique({
        where: { id: projectId }
      });
      expect(deletedProject?.deletedAt).toBeTruthy();
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .delete(`/api/projects/${projectId}`)
        .expect(401);
    });

    it('should return 403 for non-owner', async () => {
      const otherUser = 'other-user-123';
      await prisma.user.create({ data: { id: otherUser } });

      await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('x-test-user-id', otherUser)
        .expect(403);
    });
  });

  describe('POST /api/projects/update-stats', () => {
    it('should update project stats', async () => {
      const response = await request(app)
        .post('/api/projects/update-stats')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.message).toBe('Estatísticas atualizadas com sucesso');
    });
  });
});
