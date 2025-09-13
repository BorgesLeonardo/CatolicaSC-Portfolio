# Testes do Backend

Este diretório contém todos os testes do backend da aplicação de crowdfunding.

## Estrutura dos Testes

```
src/test/
├── unit/                    # Testes unitários
│   ├── controllers/         # Testes dos controladores
│   ├── services/           # Testes dos serviços
│   ├── middleware/         # Testes dos middlewares
│   └── utils/              # Testes dos utilitários
├── integration/            # Testes de integração
│   ├── projects.integration.test.ts
│   ├── categories.integration.test.ts
│   └── health.integration.test.ts
├── setup.ts               # Configuração global dos testes
└── README.md              # Este arquivo
```

## Tipos de Teste

### Testes Unitários
- **Controladores**: Testam a lógica de validação e resposta dos endpoints
- **Serviços**: Testam a lógica de negócio e interação com o banco de dados
- **Middleware**: Testam autenticação, tratamento de erros, etc.
- **Utilitários**: Testam funções auxiliares e classes de erro

### Testes de Integração
- **Rotas**: Testam endpoints completos com banco de dados real
- **Autenticação**: Testam fluxos de autenticação end-to-end
- **Validação**: Testam validação de dados em cenários reais

## Executando os Testes

### Instalar Dependências
```bash
npm install
```

### Executar Todos os Testes
```bash
npm test
```

### Executar Testes com Watch Mode
```bash
npm run test:watch
```

### Executar Testes com Cobertura
```bash
npm run test:coverage
```

### Executar Testes em CI/CD
```bash
npm run test:ci
```

## Configuração

### Variáveis de Ambiente para Testes
- `NODE_ENV=test`
- `TEST_BYPASS_AUTH=true` - Bypass de autenticação para testes
- `DATABASE_URL` - URL do banco de dados de teste

### Headers de Teste
Para simular autenticação nos testes de integração:
- `x-test-user-id`: ID do usuário para testes
- `x-test-user-role`: Role do usuário para testes
- `x-test-auth-bypass`: Controla se deve fazer bypass da autenticação

## Cobertura de Testes

O projeto está configurado para atingir **80% de cobertura** em:
- Branches (ramificações)
- Functions (funções)
- Lines (linhas)
- Statements (declarações)

### Relatórios de Cobertura
- **Terminal**: Mostra resumo no console
- **HTML**: Gera relatório em `coverage/lcov-report/index.html`
- **LCOV**: Gera arquivo `coverage/lcov.info` para integração com CI/CD

## Estrutura dos Testes

### Testes Unitários
```typescript
describe('ClassName', () => {
  describe('methodName', () => {
    it('should do something', async () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = await service.method(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Testes de Integração
```typescript
describe('API Endpoint', () => {
  it('should handle request correctly', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('x-test-user-id', 'user123')
      .expect(200);
    
    expect(response.body).toMatchObject({
      // expected structure
    });
  });
});
```

## Mocks e Stubs

### Prisma Mock
```typescript
jest.mock('../../infrastructure/prisma', () => ({
  prisma: {
    model: {
      findMany: jest.fn(),
      create: jest.fn(),
      // ... outros métodos
    }
  }
}));
```

### Service Mock
```typescript
const mockService = {
  method: jest.fn()
} as any;
```

## Boas Práticas

1. **Isolamento**: Cada teste deve ser independente
2. **Limpeza**: Limpar dados entre testes
3. **Nomenclatura**: Usar nomes descritivos para os testes
4. **Cobertura**: Manter cobertura acima de 80%
5. **Mocks**: Mockar dependências externas
6. **Dados de Teste**: Usar dados consistentes e previsíveis

## Troubleshooting

### Erro de Conexão com Banco
- Verificar se o banco de teste está rodando
- Verificar variável `DATABASE_URL`

### Erro de Autenticação
- Verificar se `TEST_BYPASS_AUTH=true`
- Verificar headers de teste

### Erro de Timeout
- Aumentar `testTimeout` no jest.config.js
- Verificar se não há operações bloqueantes
