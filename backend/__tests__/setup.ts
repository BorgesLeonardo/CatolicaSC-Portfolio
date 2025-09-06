import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config({ path: './__tests__/config/test.env' });

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
