import request from 'supertest';
import app from '../../app';
import { prisma } from '../../infrastructure/prisma';

describe('Categories Integration Tests', () => {
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
  });

  describe('GET /api/categories', () => {
    it('should list all active categories', async () => {
      // Create test categories
      const timestamp = Date.now();
      const categories = [
        {
          id: `cat-1-${timestamp}`,
          name: `Technology-${timestamp}`,
          description: 'Tech projects',
          color: '#FF0000',
          icon: 'tech-icon',
          isActive: true
        },
        {
          id: `cat-2-${timestamp}`,
          name: `Art-${timestamp}`,
          description: 'Art projects',
          color: '#00FF00',
          icon: 'art-icon',
          isActive: true
        },
        {
          id: `cat-3-${timestamp}`,
          name: `Inactive-${timestamp}`,
          description: 'This category is inactive',
          color: '#0000FF',
          icon: 'inactive-icon',
          isActive: false
        }
      ];

      for (const category of categories) {
        await prisma.category.create({ data: category });
      }

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2); // Only active categories
      
      const categoryNames = response.body.map((cat: any) => cat.name);
      expect(categoryNames.some((name: string) => name.includes('Technology'))).toBe(true);
      expect(categoryNames.some((name: string) => name.includes('Art'))).toBe(true);
      expect(categoryNames.some((name: string) => name.includes('Inactive'))).toBe(false);

      // Check structure
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('color');
      expect(response.body[0]).toHaveProperty('icon');
      expect(response.body[0]).toHaveProperty('projectsCount');
    });

    it('should return empty array when no categories exist', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should include project counts', async () => {
      const timestamp = Date.now();
      // Create category
      const category = await prisma.category.create({
        data: {
          id: `cat-1-${timestamp}`,
          name: `Technology-${timestamp}`,
          description: 'Tech projects',
          color: '#FF0000',
          icon: 'tech-icon',
          isActive: true
        }
      });

      // Create user
      const user = await prisma.user.create({
        data: { id: `user-1-${timestamp}` }
      });

      // Create projects in this category
      await prisma.project.create({
        data: {
          id: `proj-1-${timestamp}`,
          title: 'Project 1',
          description: 'Description 1',
          goalCents: 10000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: user.id,
          categoryId: category.id
        }
      });

      await prisma.project.create({
        data: {
          id: `proj-2-${timestamp}`,
          title: 'Project 2',
          description: 'Description 2',
          goalCents: 5000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: user.id,
          categoryId: category.id
        }
      });

      // Create a deleted project (should not be counted)
      await prisma.project.create({
        data: {
          id: `proj-3-${timestamp}`,
          title: 'Deleted Project',
          description: 'This project is deleted',
          goalCents: 3000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: user.id,
          categoryId: category.id,
          deletedAt: new Date()
        }
      });

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].projectsCount).toBe(2); // Only non-deleted projects
    });

    it('should order categories by name', async () => {
      const timestamp = Date.now();
      // Create categories in random order
      const categories = [
        { id: `cat-3-${timestamp}`, name: `Zebra-${timestamp}`, description: 'Z projects', color: '#000000', icon: 'z-icon', isActive: true },
        { id: `cat-1-${timestamp}`, name: `Apple-${timestamp}`, description: 'A projects', color: '#FF0000', icon: 'a-icon', isActive: true },
        { id: `cat-2-${timestamp}`, name: `Banana-${timestamp}`, description: 'B projects', color: '#00FF00', icon: 'b-icon', isActive: true }
      ];

      for (const category of categories) {
        await prisma.category.create({ data: category });
      }

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].name).toBe('Apple');
      expect(response.body[1].name).toBe('Banana');
      expect(response.body[2].name).toBe('Zebra');
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should get category by id', async () => {
      const timestamp = Date.now();
      const category = await prisma.category.create({
        data: {
          id: `cat-1-${timestamp}`,
          name: `Technology-${timestamp}`,
          description: 'Tech projects',
          color: '#FF0000',
          icon: 'tech-icon',
          isActive: true
        }
      });

      const response = await request(app)
        .get(`/api/categories/${category.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon
      });
      expect(response.body).toHaveProperty('projectsCount');
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .get('/api/categories/non-existent-id')
        .expect(404);
    });

    it('should return 404 for inactive category', async () => {
      const timestamp = Date.now();
      const category = await prisma.category.create({
        data: {
          id: `cat-1-${timestamp}`,
          name: `Inactive-${timestamp}`,
          description: 'This category is inactive',
          color: '#000000',
          icon: 'inactive-icon',
          isActive: false
        }
      });

      await request(app)
        .get(`/api/categories/${category.id}`)
        .expect(404);
    });

    it('should return 400 for invalid id format', async () => {
      await request(app)
        .get('/api/categories/invalid-id')
        .expect(400);
    });

    it('should include project counts for specific category', async () => {
      const timestamp = Date.now();
      // Create category
      const category = await prisma.category.create({
        data: {
          id: `cat-1-${timestamp}`,
          name: `Technology-${timestamp}`,
          description: 'Tech projects',
          color: '#FF0000',
          icon: 'tech-icon',
          isActive: true
        }
      });

      // Create user
      const user = await prisma.user.create({
        data: { id: `user-1-${timestamp}` }
      });

      // Create projects in this category
      await prisma.project.create({
        data: {
          id: `proj-1-${timestamp}`,
          title: 'Project 1',
          description: 'Description 1',
          goalCents: 10000,
          deadline: new Date('2024-12-31T23:59:59Z'),
          ownerId: user.id,
          categoryId: category.id
        }
      });

      const response = await request(app)
        .get(`/api/categories/${category.id}`)
        .expect(200);

      expect(response.body.projectsCount).toBe(1);
    });
  });
});
