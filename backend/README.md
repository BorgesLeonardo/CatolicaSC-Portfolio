# Católica SC Portfolio - Backend

Backend para o sistema de campanhas de financiamento coletivo desenvolvido com Node.js, Express, TypeScript, Prisma e Clerk.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Linguagem de programação
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados (Supabase)
- **Clerk** - Autenticação e gerenciamento de usuários
- **ESLint + Prettier** - Linting e formatação de código

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

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres:emCire6Jy.udXAb@db.jbuozkvrslranpnjtsen.supabase.co:5432/postgres

# Clerk Configuration
CLERK_SECRET_KEY=sk_test_dXAtYmFzaWxpc2stMjkuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_PUBLISHABLE_KEY=pk_test_dXAtYmFzaWxpc2stMjkuY2xlcmsuYWNjb3VudHMuZGV2JA

# Supabase Configuration
SUPABASE_URL=https://jbuozkvrslranpnjtsen.supabase.co
SUPABASE_ANON_KEY=pk_test_dXAtYmFzaWxpc2stMjkuY2xlcmsuYWNjb3VudHMuZGV2JA

# CORS Configuration
CORS_ORIGIN=http://localhost:9000

# Logging
LOG_LEVEL=info
```

> **🔐 SSL Configuration**: O projeto está configurado para usar o certificado SSL `prod-ca-2021.crt` do Supabase. Veja [SSL-CONFIG.md](./SSL-CONFIG.md) para detalhes.

### 3. Configurar banco de dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar migrações
npm run db:push
```

### 4. Executar o projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações (banco, clerk, etc.)
├── controllers/     # Controladores das rotas
├── middlewares/     # Middlewares customizados
├── repositories/    # Camada de acesso a dados
├── routes/          # Definição das rotas
├── schemas/         # Schemas de validação
├── services/        # Lógica de negócio
├── app.ts          # Configuração da aplicação
└── server.ts       # Ponto de entrada do servidor
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Executa em modo produção
- `npm run db:generate` - Gera cliente Prisma
- `npm run db:push` - Aplica mudanças no banco
- `npm run db:migrate` - Executa migrações
- `npm run db:studio` - Abre Prisma Studio
- `npm run lint` - Executa ESLint
- `npm run lint:fix` - Corrige problemas do ESLint
- `npm run format` - Formata código com Prettier

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com cobertura
npm run test:coverage
```

## 📊 Health Check

O servidor possui um endpoint de health check:

```
GET /dev
```

Resposta:
```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## 🔐 Autenticação

O sistema utiliza Clerk para autenticação. Todas as rotas protegidas devem incluir o header:

```
Authorization: Bearer <token>
```

## 📝 API Endpoints

### Desenvolvimento
- `GET /dev` - Health check

### Campanhas (em desenvolvimento)
- `GET /api/campaigns` - Listar campanhas
- `POST /api/campaigns` - Criar campanha
- `GET /api/campaigns/:id` - Obter campanha
- `PUT /api/campaigns/:id` - Atualizar campanha
- `DELETE /api/campaigns/:id` - Excluir campanha

### Apoios (em desenvolvimento)
- `POST /api/supports` - Criar apoio
- `GET /api/supports` - Listar apoios

### Comentários (em desenvolvimento)
- `GET /api/comments/:campaignId` - Listar comentários
- `POST /api/comments` - Criar comentário

## 🚀 Deploy

O projeto está configurado para deploy automático via GitHub Actions. As variáveis de ambiente devem ser configuradas no ambiente de produção.

## 📄 Licença

MIT
