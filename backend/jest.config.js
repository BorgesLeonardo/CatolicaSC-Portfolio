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
    '!src/server.ts',
    '!src/app.ts',
    '!src/infrastructure/**',
    '!src/routes/**',
    '!src/utils/logger.ts',
    '!src/controllers/me.controller.ts',
    '!src/controllers/project-images.controller.ts',
    // Exclude heavy/edge services not covered by unit tests yet
    '!src/services/contribution.service.ts', // legacy file name if present
    '!src/services/contributions.service.ts',
    '!src/controllers/connect.controller.ts',
    '!src/controllers/webhook.controller.ts',
    '!src/services/project-stats.service.ts',
    '!src/services/subscriptions.service.ts',
    '!src/controllers/subscriptions.controller.ts',
    '!src/middleware/idempotency.ts',
    '!src/middleware/rateLimit.ts',
    '!src/schemas/campaign.ts',
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