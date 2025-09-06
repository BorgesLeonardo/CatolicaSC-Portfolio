const { PrismaClient } = require('@prisma/client');

async function createTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔌 Conectando ao banco...');
    await prisma.$connect();
    console.log('✅ Conectado!');
    
    console.log('📝 Criando tabelas...');
    
    // Criar tabela users
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "clerkId" TEXT NOT NULL UNIQUE,
        "email" TEXT NOT NULL UNIQUE,
        "firstName" TEXT,
        "lastName" TEXT,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `;
    console.log('✅ Tabela users criada');
    
    // Criar tabela campaigns
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "campaigns" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "goal" DECIMAL(10,2) NOT NULL,
        "current" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "imageUrl" TEXT,
        "deadline" TIMESTAMP(3) NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "authorId" TEXT NOT NULL
      )
    `;
    console.log('✅ Tabela campaigns criada');
    
    // Criar tabela supports
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "supports" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "amount" DECIMAL(10,2) NOT NULL,
        "message" TEXT,
        "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "campaignId" TEXT NOT NULL,
        "userId" TEXT NOT NULL
      )
    `;
    console.log('✅ Tabela supports criada');
    
    // Criar tabela comments
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "campaignId" TEXT NOT NULL,
        "userId" TEXT NOT NULL
      )
    `;
    console.log('✅ Tabela comments criada');
    
    // Criar índices
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "campaigns_authorId_idx" ON "campaigns"("authorId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "supports_campaignId_idx" ON "supports"("campaignId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "supports_userId_idx" ON "supports"("userId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "comments_campaignId_idx" ON "comments"("campaignId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "comments_userId_idx" ON "comments"("userId")`;
    console.log('✅ Índices criados');
    
    // Criar foreign keys
    await prisma.$executeRaw`ALTER TABLE "campaigns" ADD CONSTRAINT IF NOT EXISTS "campaigns_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "supports" ADD CONSTRAINT IF NOT EXISTS "supports_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "supports" ADD CONSTRAINT IF NOT EXISTS "supports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "comments" ADD CONSTRAINT IF NOT EXISTS "comments_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "comments" ADD CONSTRAINT IF NOT EXISTS "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    console.log('✅ Foreign keys criadas');
    
    console.log('🎉 Todas as tabelas foram criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão encerrada');
  }
}

createTables();
