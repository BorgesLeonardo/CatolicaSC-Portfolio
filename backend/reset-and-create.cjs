const { PrismaClient } = require('@prisma/client');

async function resetAndCreate() {
  let prisma;
  
  try {
    console.log('🔌 Conectando ao banco...');
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Conectado!');
    
    // Fechar conexão
    await prisma.$disconnect();
    console.log('🔌 Conexão fechada');
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reconectar
    console.log('🔌 Reconectando...');
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Reconectado!');
    
    // Testar uma query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query de teste:', result);
    
    console.log('🎉 Conexão funcionando!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('🔌 Conexão encerrada');
    }
  }
}

resetAndCreate();
