import { PrismaClient } from '@prisma/client';

// Test database configuration
const testDatabaseUrl = process.env.TEST_DATABASE_URL || 'file:./test.db';

// Create a separate Prisma client for testing
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl,
    },
  },
});

// Helper function to clean up test database
export const cleanupTestDatabase = async () => {
  // Delete all records in reverse order of dependencies
  await testPrisma.comment.deleteMany();
  await testPrisma.support.deleteMany();
  await testPrisma.campaign.deleteMany();
  await testPrisma.category.deleteMany();
  await testPrisma.user.deleteMany();
};

// Helper function to seed test database with sample data
export const seedTestDatabase = async () => {
  // Create test users
  const user1 = await testPrisma.user.create({
    data: {
      clerkId: 'test_user_1',
      email: 'test1@example.com',
      firstName: 'Test',
      lastName: 'User 1',
    },
  });

  const user2 = await testPrisma.user.create({
    data: {
      clerkId: 'test_user_2',
      email: 'test2@example.com',
      firstName: 'Test',
      lastName: 'User 2',
    },
  });

  // Create test categories
  const category1 = await testPrisma.category.create({
    data: {
      name: 'Test Category 1',
      description: 'Test category description',
      color: '#FF5733',
      icon: 'test-icon',
    },
  });

  // Create test campaigns
  const campaign1 = await testPrisma.campaign.create({
    data: {
      title: 'Test Campaign 1',
      description: 'Test campaign description',
      goal: 1000.00,
      current: 0.00,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      authorId: user1.id,
      categoryId: category1.id,
    },
  });

  return {
    users: [user1, user2],
    categories: [category1],
    campaigns: [campaign1],
  };
};

// Helper function to close test database connection
export const closeTestDatabase = async () => {
  await testPrisma.$disconnect();
};
