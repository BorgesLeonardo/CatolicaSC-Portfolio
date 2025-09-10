import { isClerkConfigured, getClerkUser, verifyClerkUser } from '../config/clerk.js';
import { syncUserFromClerk, getUserByClerkId } from '../services/userService.js';
import prisma from '../config/database.js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config({ path: '.envlocal' });

async function testClerkIntegration() {
  try {
    console.log('🧪 Testando integração com Clerk...\n');

    // Teste 1: Verificar configuração
    console.log('1. Verificando configuração do Clerk...');
    if (isClerkConfigured()) {
      console.log('✅ Clerk configurado corretamente');
      console.log(`   - Secret Key: ${process.env.CLERK_SECRET_KEY ? 'Configurado' : 'Não configurado'}`);
      console.log(`   - Publishable Key: ${process.env.CLERK_PUBLISHABLE_KEY ? 'Configurado' : 'Não configurado'}`);
      console.log(`   - Webhook Secret: ${process.env.CLERK_WEBHOOK_SECRET ? 'Configurado' : 'Não configurado'}`);
    } else {
      console.log('❌ Clerk não configurado corretamente');
      console.log('   Configure as variáveis CLERK_SECRET_KEY e CLERK_PUBLISHABLE_KEY');
      return;
    }

    // Teste 2: Verificar conexão com banco
    console.log('\n2. Verificando conexão com banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // Teste 3: Verificar tabela users
    console.log('\n3. Verificando tabela users...');
    const userCount = await prisma.user.count();
    console.log(`✅ Tabela users encontrada com ${userCount} usuários`);

    // Teste 4: Listar usuários existentes
    if (userCount > 0) {
      console.log('\n4. Usuários existentes no banco:');
      const users = await prisma.user.findMany({
        select: {
          id: true,
          clerkUserId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        },
        take: 5
      });

      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.name || 'Sem nome'}) - ${user.role}`);
      });
    }

    // Teste 5: Verificar estrutura da tabela
    console.log('\n5. Verificando estrutura da tabela users...');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    console.log('✅ Estrutura da tabela users:');
    tableInfo.forEach(column => {
      console.log(`   - ${column.column_name}: ${column.data_type} ${column.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });

    console.log('\n🎉 Integração com Clerk configurada com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Configure as chaves reais do Clerk no arquivo .envlocal');
    console.log('   2. Configure o webhook do Clerk para: http://localhost:3000/api/auth/webhook');
    console.log('   3. Teste a autenticação com um token JWT válido');

  } catch (error) {
    console.error('❌ Erro ao testar integração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa o teste
testClerkIntegration();
