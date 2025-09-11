#!/usr/bin/env node

/**
 * Script de configuração inicial do projeto
 * Execute: node setup.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('🚀 Configurando projeto Catolica SC Portfolio Backend...\n');

// Verificar se .env existe
if (!existsSync('.env')) {
  console.log('📝 Criando arquivo .env...');
  const envContent = `# Database (Supabase Postgres)
DATABASE_URL="postgresql://USER:PWD@HOST:5432/DB?sslmode=require"

# Clerk (backend)
CLERK_SECRET_KEY=sk_live_or_test_xxx

# Server
PORT=3333
`;
  writeFileSync('.env', envContent);
  console.log('✅ Arquivo .env criado!');
  console.log('⚠️  Lembre-se de configurar as variáveis de ambiente corretas\n');
} else {
  console.log('✅ Arquivo .env já existe\n');
}

// Verificar se node_modules existe
if (!existsSync('node_modules')) {
  console.log('📦 Instalando dependências...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas!\n');
  } catch (error) {
    console.log('❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependências já instaladas\n');
}

// Gerar cliente Prisma
console.log('🔧 Gerando cliente Prisma...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente Prisma gerado!\n');
} catch (error) {
  console.log('❌ Erro ao gerar cliente Prisma:', error.message);
  console.log('💡 Verifique se a DATABASE_URL está configurada corretamente\n');
}

console.log('🎉 Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure as variáveis de ambiente no arquivo .env');
console.log('2. Execute: npm run prisma:migrate (para criar as tabelas)');
console.log('3. Execute: npm run dev (para iniciar o servidor)');
console.log('4. Execute: npm run test:api (para testar a API)');
console.log('\n📚 Consulte o README.md para mais informações');



