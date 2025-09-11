#!/usr/bin/env node

/**
 * Script de teste manual para a API
 * Execute: node tests/test-api.js
 */

const BASE_URL = 'http://localhost:3333';

// Função para fazer requisições
async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      data: jsonData
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      data: { error: error.message }
    };
  }
}

// Testes
async function runTests() {
  console.log('🧪 Iniciando testes da API...\n');
  
  // Teste 1: Health Check
  console.log('1️⃣ Testando Health Check...');
  const health = await request(`${BASE_URL}/health`);
  console.log(`   Status: ${health.status}`);
  console.log(`   Resposta: ${JSON.stringify(health.data)}\n`);
  
  // Teste 2: Listar projetos (público)
  console.log('2️⃣ Testando listagem pública de projetos...');
  const projects = await request(`${BASE_URL}/api/projects`);
  console.log(`   Status: ${projects.status}`);
  console.log(`   Resposta: ${JSON.stringify(projects.data, null, 2)}\n`);
  
  // Teste 3: Acessar rota privada sem token (deve falhar)
  console.log('3️⃣ Testando rota privada sem token (deve retornar 401)...');
  const unauthorized = await request(`${BASE_URL}/api/projects/mine`);
  console.log(`   Status: ${unauthorized.status}`);
  console.log(`   Resposta: ${JSON.stringify(unauthorized.data)}\n`);
  
  // Teste 4: Criar projeto sem token (deve falhar)
  console.log('4️⃣ Testando criação de projeto sem token (deve retornar 401)...');
  const createUnauthorized = await request(`${BASE_URL}/api/projects`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'Teste sem token',
      description: 'Este teste deve falhar',
      goalCents: 100000,
      deadline: '2025-12-31T23:59:59.000Z'
    })
  });
  console.log(`   Status: ${createUnauthorized.status}`);
  console.log(`   Resposta: ${JSON.stringify(createUnauthorized.data)}\n`);
  
  console.log('✅ Testes concluídos!');
  console.log('\n📝 Para testar com autenticação:');
  console.log('   1. Obtenha um token JWT do Clerk');
  console.log('   2. Use o comando curl fornecido no README');
  console.log('   3. Ou use o Insomnia/Postman com o token no header Authorization');
}

// Verificar se fetch está disponível (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Este script requer Node.js 18+ ou instale node-fetch');
  console.log('   npm install node-fetch');
  process.exit(1);
}

runTests().catch(console.error);



