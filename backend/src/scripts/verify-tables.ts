import dotenv from 'dotenv';
import Database from '../config/database';

// Load environment variables
dotenv.config();

async function verifyTables() {
  console.log('🔍 Verificando tabelas no banco de dados...');
  
  try {
    await Database.connect();
    const prisma = Database.getInstance();
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('📋 Tabelas encontradas:');
    console.log(tables);
    
    // Check if our specific tables exist
    const expectedTables = ['users', 'categories', 'campaigns', 'contributions', 'comments', 'webhook_events'];
    
    for (const tableName of expectedTables) {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        );
      `;
      
      const exists = (tableExists as any[])[0]?.exists;
      console.log(`${exists ? '✅' : '❌'} Tabela '${tableName}': ${exists ? 'Existe' : 'Não encontrada'}`);
    }
    
    // Test a simple insert/select to verify connection
    console.log('\n🧪 Testando operações básicas...');
    
    // Check if we can query the users table
    const userCount = await prisma.user.count();
    console.log(`👥 Total de usuários: ${userCount}`);
    
    const categoryCount = await prisma.category.count();
    console.log(`📂 Total de categorias: ${categoryCount}`);
    
    const campaignCount = await prisma.campaign.count();
    console.log(`🎯 Total de campanhas: ${campaignCount}`);
    
    console.log('\n✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  } finally {
    await Database.disconnect();
  }
}

// Run the verification
verifyTables();

