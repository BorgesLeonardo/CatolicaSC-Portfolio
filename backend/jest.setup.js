const dotenv = require('dotenv');

// Load environment variables for testing
dotenv.config({ path: './src/__tests__/config/test.env' });

// Mock console methods to reduce noise in tests
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Global test timeout
jest.setTimeout(10000);

// Global test database setup
beforeAll(async () => {
  // Setup test database
  const { testPrisma } = await import('./src/config/testDatabase');
  global.testPrisma = testPrisma;
});

afterAll(async () => {
  // Cleanup test database
  if (global.testPrisma) {
    await global.testPrisma.$disconnect();
  }
});