import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Comment Controller', () => {
  let authToken: string;
  let userId: string;
  let campaignId: string;

  beforeAll(async () => {
    authToken = 'mock-jwt-token';
    userId = 'test-user-id';
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.comment.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.user.deleteMany();

    // Create test user and campaign
    await prisma.user.create({
      data: {
        id: userId,
        clerkId: 'clerk-test-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }
    });

    const campaign = await prisma.campaign.create({
      data: {
        title: 'Test Campaign',
        description: 'Test Description',
        goal: 1000,
        deadline: new Date('2024-12-31'),
        authorId: userId
      }
    });
    campaignId = campaign.id;
  });

  describe('POST /api/comments', () => {
    it('should create a new comment with valid data', async () => {
      const commentData = {
        campaignId,
        content: 'This is a great campaign!'
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        content: commentData.content,
        userId: userId
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('required');
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          campaignId: 'non-existent-id',
          content: 'Test comment'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .post('/api/comments')
        .send({
          campaignId,
          content: 'Test comment'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/comments/campaign/:campaignId', () => {
    beforeEach(async () => {
      // Create test comments
      await prisma.comment.create({
        data: {
          campaignId,
          userId,
          content: 'First comment'
        }
      });

      await prisma.comment.create({
        data: {
          campaignId,
          userId,
          content: 'Second comment'
        }
      });
    });

    it('should return all comments for a campaign', async () => {
      const response = await request(app)
        .get(`/api/comments/campaign/${campaignId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        content: expect.any(String),
        createdAt: expect.any(String),
        user: expect.objectContaining({
          firstName: expect.any(String),
          lastName: expect.any(String)
        })
      });
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/api/comments/campaign/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/comments/:id', () => {
    let commentId: string;

    beforeEach(async () => {
      const comment = await prisma.comment.create({
        data: {
          campaignId,
          userId,
          content: 'Original comment'
        }
      });
      commentId = comment.id;
    });

    it('should update comment with valid data', async () => {
      const updateData = {
        content: 'Updated comment content'
      };

      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(updateData);
    });

    it('should return 403 for non-author trying to update', async () => {
      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer different-user-token`)
        .send({ content: 'Hacked comment' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    let commentId: string;

    beforeEach(async () => {
      const comment = await prisma.comment.create({
        data: {
          campaignId,
          userId,
          content: 'Comment to delete'
        }
      });
      commentId = comment.id;
    });

    it('should delete comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify comment is deleted
      const deletedComment = await prisma.comment.findUnique({
        where: { id: commentId }
      });
      expect(deletedComment).toBeNull();
    });

    it('should return 403 for non-author trying to delete', async () => {
      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer different-user-token`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
