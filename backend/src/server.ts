import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import app from './app';
import { prisma } from './config/supabase-ssl';

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    // Test database connection only if DATABASE_URL is provided
    if (process.env.DATABASE_URL) {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } else {
      console.log('⚠️  Database connection skipped (no DATABASE_URL)');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/dev`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
