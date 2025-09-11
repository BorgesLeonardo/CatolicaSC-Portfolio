# Catolica SC Portfolio - Backend API

Backend API para a plataforma de crowdfunding desenvolvida como parte do portfólio da Católica SC.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM para PostgreSQL
- **Clerk** - Autenticação e autorização
- **Zod** - Validação de dados
- **Supabase** - Banco de dados PostgreSQL

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Clerk

## ⚙️ Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database (Supabase Postgres)
DATABASE_URL="postgresql://USER:PWD@HOST:5432/DB?sslmode=require"

# Clerk (backend)
CLERK_SECRET_KEY=sk_live_or_test_xxx

# Server
PORT=3333
```

**Como obter as credenciais:**

- **DATABASE_URL**: No painel do Supabase, vá em Settings > Database e copie a connection string
- **CLERK_SECRET_KEY**: No painel do Clerk, vá em API Keys e copie a Secret Key

### 3. Configurar banco de dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Aplicar migrations
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para visualizar dados
npm run prisma:studio
```

### 4. Executar aplicação

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📚 API Endpoints

### Health Check
```
GET /health
```

### Projetos

#### Listar projetos (público)
```
GET /api/projects?page=1&pageSize=10
```

**Resposta:**
```json
{
  "page": 1,
  "pageSize": 10,
  "total": 25,
  "totalPages": 3,
  "items": [
    {
      "id": "cuid123",
      "title": "Projeto Exemplo",
      "description": "Descrição do projeto",
      "goalCents": 500000,
      "deadline": "2025-12-31T23:59:59.000Z",
      "imageUrl": "https://exemplo.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "owner": {
        "id": "user_123",
        "name": "João Silva",
        "email": "joao@exemplo.com"
      }
    }
  ]
}
```

#### Criar projeto (privado)
```
POST /api/projects
Authorization: Bearer <JWT_DO_CLERK>
Content-Type: application/json

{
  "title": "Meu Projeto",
  "description": "Descrição do projeto",
  "goalCents": 1000000,
  "deadline": "2025-12-31T23:59:59.000Z",
  "imageUrl": "https://exemplo.com/image.jpg"
}
```

#### Listar meus projetos (privado)
```
GET /api/projects/mine
Authorization: Bearer <JWT_DO_CLERK>
```

#### Obter projeto específico (público)
```
GET /api/projects/:id
```

**Resposta:**
```json
{
  "id": "cuid123",
  "title": "Projeto Exemplo",
  "description": "Descrição do projeto",
  "goalCents": 500000,
  "deadline": "2025-12-31T23:59:59.000Z",
  "imageUrl": "https://exemplo.com/image.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "ownerId": "user_123"
}
```

#### Editar projeto (privado, somente dono)
```
PATCH /api/projects/:id
Authorization: Bearer <JWT_DO_CLERK>
Content-Type: application/json

{
  "title": "Novo título da campanha",
  "goalCents": 750000,
  "description": "Descrição atualizada"
}
```

**Resposta:**
```json
{
  "id": "cuid123",
  "title": "Novo título da campanha",
  "description": "Descrição atualizada",
  "goalCents": 750000,
  "deadline": "2025-12-31T23:59:59.000Z",
  "imageUrl": "https://exemplo.com/image.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "ownerId": "user_123"
}
```

#### Excluir projeto (privado, somente dono)
```
DELETE /api/projects/:id
Authorization: Bearer <JWT_DO_CLERK>
```

**Resposta:**
```
HTTP/1.1 204 No Content
```

## 🧪 Testes Manuais

### 1. Teste sem autenticação (deve retornar 401)

```bash
curl -i http://localhost:3333/api/projects/mine
```

**Esperado:**
```
HTTP/1.1 401 Unauthorized
{"error":"Unauthorized"}
```

### 2. Teste com autenticação (deve retornar 201)

```bash
curl -i http://localhost:3333/api/projects \
  -H "Authorization: Bearer <JWT_DO_CLERK>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Campanha Teste",
    "description":"Primeira campanha de teste",
    "goalCents": 500000,
    "deadline":"2025-12-31T23:59:59.000Z",
    "imageUrl":"https://exemplo.com/banner.png"
  }'
```

**Esperado:**
```
HTTP/1.1 201 Created
{
  "id": "cuid123",
  "title": "Campanha Teste",
  "description": "Primeira campanha de teste",
  "goalCents": 500000,
  "deadline": "2025-12-31T23:59:59.000Z",
  "imageUrl": "https://exemplo.com/banner.png",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "owner": {
    "id": "user_123",
    "name": null,
    "email": null
  }
}
```

### 3. Teste de listagem pública

```bash
curl -i http://localhost:3333/api/projects
```

**Esperado:**
```
HTTP/1.1 200 OK
{
  "page": 1,
  "pageSize": 10,
  "total": 1,
  "totalPages": 1,
  "items": [...]
}
```

### 4. Teste GET projeto específico (público)

```bash
curl -i http://localhost:3333/api/projects/<PROJECT_ID>
```

**Esperado:**
```
HTTP/1.1 200 OK
{
  "id": "cuid123",
  "title": "Projeto Exemplo",
  "description": "Descrição do projeto",
  "goalCents": 500000,
  "deadline": "2025-12-31T23:59:59.000Z",
  "imageUrl": "https://exemplo.com/image.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "ownerId": "user_123"
}
```

### 5. Teste PATCH projeto (privado, dono)

```bash
curl -i -X PATCH http://localhost:3333/api/projects/<PROJECT_ID> \
  -H "Authorization: Bearer <JWT_DO_CLERK>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Novo título da campanha",
    "goalCents": 750000
  }'
```

**Esperado:**
```
HTTP/1.1 200 OK
{
  "id": "cuid123",
  "title": "Novo título da campanha",
  "goalCents": 750000,
  "deadline": "2025-12-31T23:59:59.000Z",
  "imageUrl": "https://exemplo.com/image.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "ownerId": "user_123"
}
```

### 6. Teste DELETE projeto (privado, dono)

```bash
curl -i -X DELETE http://localhost:3333/api/projects/<PROJECT_ID> \
  -H "Authorization: Bearer <JWT_DO_CLERK>"
```

**Esperado:**
```
HTTP/1.1 204 No Content
```

### 7. Teste de erros - Validação

```bash
# ID inválido
curl -i http://localhost:3333/api/projects/invalid-id

# PATCH sem autenticação
curl -i -X PATCH http://localhost:3333/api/projects/some-id \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'

# PATCH com body vazio
curl -i -X PATCH http://localhost:3333/api/projects/some-id \
  -H "Authorization: Bearer <JWT_DO_CLERK>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Esperados:**
```
HTTP/1.1 400 Bad Request
{"error":"ValidationError","issues":...}

HTTP/1.1 401 Unauthorized
{"error":"Unauthorized"}

HTTP/1.1 400 Bad Request
{"error":"ValidationError","issues":...}
```

### 8. Teste de autorização - Acesso negado

```bash
# Tentar editar projeto de outro usuário
curl -i -X PATCH http://localhost:3333/api/projects/<PROJECT_ID_DE_OUTRO_USUARIO> \
  -H "Authorization: Bearer <JWT_DO_CLERK_DIFERENTE>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Tentativa de invasão"}'
```

**Esperado:**
```
HTTP/1.1 403 Forbidden
{"error":"Forbidden"}
```

## 🔧 Como obter token do Clerk para testes

1. Acesse o painel do Clerk
2. Vá em "JWT Templates"
3. Crie um template ou use o padrão
4. Use o token gerado no header `Authorization: Bearer <token>`

**Alternativa:** Use o frontend da aplicação para fazer login e copiar o token do localStorage ou network tab.

## 📊 Log de Execução

### Configuração inicial
- ✅ Estrutura do projeto criada
- ✅ Dependências instaladas
- ✅ Prisma configurado com modelos User e Project
- ✅ Middleware de autenticação implementado
- ✅ Endpoints de projetos implementados
- ✅ Validação com Zod configurada
- ✅ Tratamento de erros implementado

### Testes realizados
- ✅ Health check funcionando
- ✅ Endpoint público GET /api/projects funcionando
- ✅ Endpoint privado POST /api/projects protegido (401 sem token)
- ✅ Endpoint privado GET /api/projects/mine protegido (401 sem token)
- ✅ Criação de usuário automática no primeiro acesso
- ✅ Paginação funcionando corretamente
- ✅ Endpoint público GET /api/projects/:id funcionando
- ✅ Endpoint privado PATCH /api/projects/:id com validação de owner
- ✅ Endpoint privado DELETE /api/projects/:id com validação de owner
- ✅ Validação de entrada com Zod em todos os endpoints
- ✅ Tratamento de erros 400, 401, 403, 404 implementado
- ✅ Respostas consistentes para melhor DX

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Cliente Prisma
│   ├── middleware/
│   │   └── auth.ts            # Middleware de autenticação
│   ├── routes/
│   │   └── projects.ts        # Rotas de projetos
│   ├── app.ts                 # Configuração do Express
│   └── server.ts              # Servidor
├── prisma/
│   └── schema.prisma          # Schema do banco
├── package.json
├── tsconfig.json
└── README.md
```

## 🚨 Troubleshooting

### Erro de conexão com banco
- Verifique se a DATABASE_URL está correta
- Confirme se o Supabase está ativo
- Teste a conexão no painel do Supabase

### Erro 401 em rotas protegidas
- Verifique se o CLERK_SECRET_KEY está correto
- Confirme se o token JWT é válido
- Verifique se o token não expirou

### Erro de validação
- Verifique se todos os campos obrigatórios estão presentes
- Confirme se os tipos de dados estão corretos
- Verifique se as datas estão no formato ISO 8601
