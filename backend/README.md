# Backend - Católica SC Portfolio

Backend API para a plataforma de crowdfunding Católica SC Portfolio.

## Arquitetura

O projeto segue o padrão MVC (Model-View-Controller) com separação clara de responsabilidades:

```
src/
├── controllers/          # Controladores das rotas
│   ├── projects.controller.ts
│   ├── contributions.controller.ts
│   ├── comments.controller.ts
│   └── health.controller.ts
├── services/            # Lógica de negócio
│   ├── projects.service.ts
│   ├── contributions.service.ts
│   └── comments.service.ts
├── middleware/          # Middlewares do Express
│   ├── auth.ts          # Autenticação Clerk
│   └── error.ts         # Tratamento global de erros
├── routes/              # Definição das rotas
│   ├── projects.ts
│   ├── contributions.ts
│   └── comments.ts
├── infrastructure/      # Infraestrutura
│   └── prisma.ts        # Cliente Prisma
├── utils/               # Utilitários
│   └── AppError.ts      # Classe de erro personalizada
└── lib/                 # Bibliotecas externas
    └── stripe.ts        # Cliente Stripe
```

## Tecnologias

- **Node.js** + **Express** - Framework web
- **TypeScript** - Linguagem de programação
- **Prisma** - ORM para banco de dados
- **Supabase** - Banco de dados PostgreSQL
- **Clerk** - Autenticação e autorização
- **Stripe** - Processamento de pagamentos
- **Jest** - Framework de testes
- **Supertest** - Testes de integração

## Endpoints

### Projetos
- `POST /api/projects` - Criar projeto (privado)
- `GET /api/projects` - Listar projetos (público)
- `GET /api/projects/mine` - Meus projetos (privado)
- `GET /api/projects/:id` - Detalhe do projeto (público)
- `PATCH /api/projects/:id` - Atualizar projeto (privado)
- `DELETE /api/projects/:id` - Excluir projeto (privado)

### Contribuições
- `POST /api/contributions/checkout` - Criar checkout Stripe (privado)
- `GET /api/contributions/project/:projectId` - Listar contribuições (público)

### Comentários
- `POST /api/projects/:id/comments` - Criar comentário (privado)
- `GET /api/projects/:id/comments` - Listar comentários (público)
- `DELETE /api/comments/:commentId` - Excluir comentário (privado)

### Health Check
- `GET /health` - Status da API (público)

## Como executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Testes
```bash
# Executar todos os testes
npm test

# Executar apenas testes unitários
npm test -- --testPathPattern="unit"

# Executar apenas testes E2E
npm test -- --testPathPattern="e2e"

# Executar com cobertura
npm run test:coverage

# Executar em modo watch
npm run test:watch

# Executar testes para CI/CD (com relatórios SonarQube)
npm run test:ci
```

### Banco de dados
```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk
CLERK_SECRET_KEY="sk_..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CURRENCY="BRL"

# Aplicação
APP_BASE_URL="http://localhost:3000"
```

### Variáveis de ambiente para testes

Para executar os testes, as seguintes variáveis são configuradas automaticamente no `jest.setup.ts`:

```env
# Configuração de ambiente para testes
NODE_ENV=test
TEST_BYPASS_AUTH=true

# Configurações do banco de dados para testes
DATABASE_URL=postgresql://test:test@localhost:5432/test_db

# Configurações do Stripe para testes
STRIPE_SECRET_KEY=sk_test_mock_key
STRIPE_WEBHOOK_SECRET=whsec_test_mock_secret

# Configurações do Clerk para testes
CLERK_SECRET_KEY=sk_test_mock_clerk_key
```

## Estrutura de dados

### Projeto
```typescript
interface Project {
  id: string
  ownerId: string
  title: string
  description?: string
  goalCents: number
  deadline: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}
```

### Contribuição
```typescript
interface Contribution {
  id: string
  projectId: string
  contributorId: string
  amountCents: number
  currency: string
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'
  stripePaymentIntentId?: string
  stripeCheckoutSessionId?: string
  createdAt: string
  updatedAt: string
}
```

### Comentário
```typescript
interface Comment {
  id: string
  projectId: string
  authorId: string
  content: string
  createdAt: string
  updatedAt: string
}
```

## Autenticação

O projeto usa o Clerk para autenticação. Todas as rotas privadas requerem um token Bearer no header `Authorization`:

```
Authorization: Bearer <token>
```

## Tratamento de erros

O projeto usa uma classe `AppError` personalizada para erros padronizados:

```typescript
throw new AppError('Mensagem de erro', 400, { detalhes: 'opcional' })
```

## Testes

### Estrutura de Testes
```
tests/
├── e2e/                    # Testes de integração (Supertest)
│   ├── helpers/            # Helpers para testes E2E
│   │   └── auth.ts         # Helpers de autenticação
│   ├── setupDb.ts          # Setup do banco de dados
│   ├── health.e2e.spec.ts
│   ├── projects.e2e.spec.ts
│   ├── contributions.e2e.spec.ts
│   └── comments.e2e.spec.ts
├── unit/                   # Testes de unidade
│   ├── services/
│   │   ├── projects.service.spec.ts
│   │   ├── contributions.service.spec.ts
│   │   └── comments.service.spec.ts
│   ├── controllers/
│   │   ├── projects.controller.spec.ts
│   │   ├── contributions.controller.spec.ts
│   │   └── comments.controller.spec.ts
│   └── utils/
│       └── appError.spec.ts
├── factories/              # Fábricas para dados de teste
│   ├── userFactory.ts
│   ├── projectFactory.ts
│   ├── contributionFactory.ts
│   ├── commentFactory.ts
│   └── index.ts
└── __mocks__/              # Mocks para testes
    ├── prisma.ts
    ├── authClerk.ts
    └── stripe.ts
```

### Sistema de Bypass de Autenticação

Para testes E2E, o sistema suporta bypass de autenticação usando headers especiais:

```typescript
// Helper para adicionar headers de autenticação de teste
import { withTestUser, withTestAdmin, withoutAuth } from './helpers/auth';

// Usuário padrão
const res = await withTestUser(request(app).get('/api/projects'));

// Usuário admin
const res = await withTestAdmin(request(app).get('/api/projects'));

// Usuário específico
const res = await withTestUserCustom(request(app).get('/api/projects'), 'user-123', 'admin');

// Sem autenticação (para testar erros 401)
const res = await withoutAuth(request(app).get('/api/projects'));
```

### Fábricas de Dados

O sistema inclui fábricas determinísticas para criar dados de teste consistentes:

```typescript
import { createProject, createActiveProject, createContribution } from '../factories';

// Projeto ativo (com datas futuras)
const project = createActiveProject({
  id: 'proj_1',
  title: 'Meu Projeto',
  ownerId: 'user_1',
});

// Contribuição completada
const contribution = createContribution({
  id: 'contrib_1',
  projectId: 'proj_1',
  contributorId: 'user_1',
  amountCents: 5000,
  status: 'completed',
});
```

### Cobertura de Testes
Os testes cobrem:
- **E2E**: Rotas da API (sucesso e erro) com bypass de autenticação
- **Unitários**: Services, controllers, utils e lógica de negócio
- **Mocks**: Prisma, Clerk e Stripe para isolamento
- **Validação**: Dados de entrada e saída
- **Cenários de erro**: 400, 401, 403, 404, 422
- **Branches**: Caminhos de código alternativos

**Cobertura mínima: 82% branches, 80% functions, lines, statements**

### Relatórios
- **LCOV**: `coverage/lcov.info` (cobertura de código)
- **JUnit**: `coverage/junit.xml` (resultados de testes)
- **SonarQube**: `coverage/sonar-report.xml` (métricas para SonarQube)

### Configuração de Testes

O Jest está configurado com:
- **Timeouts**: 10s para unitários, 15s para E2E
- **Projetos separados**: unit e e2e com configurações específicas
- **Cobertura**: Threshold de 82% para branches
- **Mocks automáticos**: Prisma, Clerk e Stripe

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request