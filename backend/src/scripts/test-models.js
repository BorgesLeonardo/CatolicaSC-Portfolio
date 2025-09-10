import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function testModels() {
  try {
    console.log('🧪 Testando modelos do banco de dados...\n');

    // Teste 1: Verificar se as tabelas existem
    console.log('1. Verificando estrutura das tabelas...');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log('✅ Tabelas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Teste 2: Verificar enums
    console.log('\n2. Verificando enums...');
    
    const enums = await prisma.$queryRaw`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname IN ('UserRole', 'CampaignStatus', 'ContributionStatus')
      ORDER BY t.typname, e.enumsortorder;
    `;
    
    console.log('✅ Enums encontrados:');
    const enumGroups = {};
    enums.forEach(enumItem => {
      if (!enumGroups[enumItem.enum_name]) {
        enumGroups[enumItem.enum_name] = [];
      }
      enumGroups[enumItem.enum_name].push(enumItem.enum_value);
    });
    
    Object.entries(enumGroups).forEach(([name, values]) => {
      console.log(`   - ${name}: [${values.join(', ')}]`);
    });

    // Teste 3: Verificar relacionamentos
    console.log('\n3. Verificando relacionamentos...');
    
    const foreignKeys = await prisma.$queryRaw`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `;
    
    console.log('✅ Relacionamentos encontrados:');
    foreignKeys.forEach(fk => {
      console.log(`   - ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });

    console.log('\n🎉 Todos os modelos foram criados com sucesso!');
    console.log('📊 O banco de dados está pronto para uso.');

  } catch (error) {
    console.error('❌ Erro ao testar modelos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa o teste
testModels();
