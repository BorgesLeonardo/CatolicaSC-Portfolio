import dotenv from 'dotenv';
import Database from '../config/database';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📊 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  try {
    // Test connection
    await Database.connect();
    
    // Test health check
    const isHealthy = await Database.healthCheck();
    
    if (isHealthy) {
      console.log('✅ Database connection test successful!');
      
      // Test a simple query
      const prisma = Database.getInstance();
      const result = await prisma.$queryRaw`SELECT version() as version`;
      console.log('📋 PostgreSQL version:', result);
      
    } else {
      console.log('❌ Database health check failed');
    }
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    process.exit(1);
  } finally {
    await Database.disconnect();
    process.exit(0);
  }
}

// Run the test
testConnection();

