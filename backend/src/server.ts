import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import app from './app';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';

const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    // Test database connection only if DATABASE_URL is provided
    if (process.env.DATABASE_URL) {
      await prisma.$connect();
      logger.info('✅ Database connected successfully');
    } else {
      logger.warn('⚠️  Database connection skipped (no DATABASE_URL)');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/dev`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
