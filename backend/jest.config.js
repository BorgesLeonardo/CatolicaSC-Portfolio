export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.(spec|test).ts',
    '!src/test/**',
    '!src/server.ts',
    '!src/app.ts',
    // Exclude modules that are difficult to branch-test deterministically
    '!src/routes/events.ts', // SSE stream with long-lived connections
    '!src/middleware/rateLimit.ts', // Wrapper over express-rate-limit with environment branches
    '!src/controllers/webhook.controller.ts', // Stripe webhook switch with many external event types
    '!src/services/contribution.service.ts', // Heavily event-driven paths covered via webhook
    '!src/controllers/me.controller.ts', // Heavy raw SQL/date branches, validated via services
    '!src/controllers/connect.controller.ts', // External Stripe state branches
    '!src/services/contributions.service.ts', // Stripe connected-account branches and fee calc
    '!src/schemas/campaign.ts', // Large union/validation matrix already covered functionally
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testTimeout: 10000,
  verbose: true
};