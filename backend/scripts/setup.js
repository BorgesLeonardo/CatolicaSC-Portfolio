#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando o backend do Crowdfunding...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Criando arquivo .env a partir do template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Arquivo .env criado!');
    console.log('⚠️  Lembre-se de configurar suas credenciais no arquivo .env');
  } else {
    console.log('❌ Arquivo env.example não encontrado!');
    process.exit(1);
  }
} else {
  console.log('✅ Arquivo .env já existe');
}

// Generate Prisma client
console.log('\n🔧 Gerando cliente Prisma...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Cliente Prisma gerado com sucesso!');
} catch (error) {
  console.log('❌ Erro ao gerar cliente Prisma:', error.message);
}

console.log('\n🎉 Configuração inicial concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure suas credenciais no arquivo .env');
console.log('2. Execute: npm run prisma:migrate');
console.log('3. Execute: npm run dev');
console.log('\n📚 Para mais informações, consulte o README.md');

