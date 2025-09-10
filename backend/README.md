# Backend - Plataforma de Crowdfunding

Este é o backend da Plataforma de Crowdfunding, desenvolvido com Node.js, Express e Prisma, conectado ao banco de dados PostgreSQL do Supabase.

## 🚀 Configuração

### Pré-requisitos

- Node.js >= 22.x
- npm ou yarn
- Conta no Supabase

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente no arquivo `.envlocal`:
```env
# Database Configuration (Supabase PostgreSQL)
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.jbuozkvrslranpnjtsen:emCire6Jy.udXAb@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.jbuozkvrslranpnjtsen:emCire6Jy.udXAb@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

3. Gere o cliente Prisma:
```bash
npm run db:generate
```

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📊 Scripts Disponíveis

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento com nodemon
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:push` - Sincroniza o schema com o banco de dados
- `npm run db:migrate` - Executa migrações do banco de dados
- `npm run db:studio` - Abre o Prisma Studio

## 🔗 Endpoints

### GET /
Retorna informações básicas do servidor.

### GET /health
Verifica a saúde do servidor e conexão com o banco de dados.

## 🗄️ Banco de Dados

O projeto utiliza:
- **Supabase PostgreSQL** como banco de dados principal
- **Prisma** como ORM
- **Connection Pooling** via PgBouncer para melhor performance

### Configuração do Prisma

O arquivo `prisma/schema.prisma` está configurado para:
- Usar PostgreSQL como provider
- Utilizar `DATABASE_URL` para operações normais (com pooling)
- Utilizar `DIRECT_URL` para migrações (conexão direta)

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # Configuração do Prisma
│   ├── controllers/         # Controladores das rotas
│   ├── middleware/          # Middlewares customizados
│   ├── routes/             # Definição das rotas
│   └── index.js            # Arquivo principal
├── prisma/
│   └── schema.prisma       # Schema do banco de dados
├── .envlocal               # Variáveis de ambiente
├── package.json
└── README.md
```

## ✅ Status da Conexão

A conexão com o Supabase PostgreSQL foi testada e está funcionando corretamente. O servidor inicia automaticamente e verifica a conectividade com o banco de dados.

## 🗄️ Modelos do Banco de Dados

O banco de dados foi configurado com os seguintes modelos baseados no diagrama ERD:

### 📊 Tabelas Criadas

1. **users** - Usuários do sistema
   - Campos: id, clerk_user_id, email, name, image_url, role, created_at, updated_at
   - Relacionamentos: campaigns, contributions, comments

2. **categories** - Categorias de campanhas
   - Campos: id, name, description
   - Relacionamentos: campaigns

3. **campaigns** - Campanhas de crowdfunding
   - Campos: id, creator_id, category_id, slug, title, description, goal, status, start_date, end_date, image_url, stripe_product_id, stripe_price_id, stripe_payment_link_url, created_at, updated_at
   - Relacionamentos: creator, category, contributions, comments

4. **contributions** - Contribuições para campanhas
   - Campos: id, user_id, campaign_id, amount, currency, stripe_checkout_session_id, stripe_payment_intent_id, status, is_anonymous, created_at
   - Relacionamentos: user, campaign, webhook_events

5. **comments** - Comentários nas campanhas
   - Campos: id, campaign_id, author_user_id, content, created_at, deleted_at
   - Relacionamentos: campaign, author

6. **webhook_events** - Eventos de webhook (Stripe)
   - Campos: id, provider, event_id, type, payload, contribution_id, received_at, processed_at, signature_verified
   - Relacionamentos: contribution

### 🔢 Enums Definidos

- **UserRole**: USER, ADMIN
- **CampaignStatus**: DRAFT, ACTIVE, COMPLETED, CANCELLED, PAUSED
- **ContributionStatus**: PENDING, COMPLETED, FAILED, REFUNDED

### ✅ Status da Configuração

- ✅ Todas as tabelas foram criadas no Supabase
- ✅ Relacionamentos configurados corretamente
- ✅ Enums definidos e funcionando
- ✅ Cliente Prisma gerado e testado

## 🔐 Autenticação com Clerk

A autenticação está implementada com integração completa ao Clerk:

### ✅ Funcionalidades Implementadas

- **Middleware de Autenticação**: Validação JWT automática
- **Sincronização de Usuários**: Criação automática no banco quando usuário se registra no Clerk
- **Webhooks**: Sincronização em tempo real de mudanças no Clerk
- **Rotas de Perfil**: Gerenciamento de dados do usuário
- **Autorização por Roles**: Suporte a USER e ADMIN

### 📊 Endpoints de Autenticação

- `GET /api/auth/profile` - Perfil do usuário
- `PUT /api/auth/profile` - Atualizar perfil
- `GET /api/auth/status` - Status da autenticação
- `GET /api/auth/stats` - Estatísticas do usuário
- `POST /api/auth/webhook` - Webhook do Clerk
- `POST /api/auth/sync` - Sincronização manual

### 🔧 Configuração Necessária

Configure as variáveis no `.envlocal`:
```env
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
```

## 🔧 Próximos Passos

1. ✅ ~~Definir os modelos do banco de dados no `schema.prisma`~~
2. ✅ ~~Criar as migrações iniciais~~
3. ✅ ~~Adicionar autenticação com Clerk~~
4. Implementar as rotas da API (campanhas, contribuições)
5. Integrar com Stripe para pagamentos
