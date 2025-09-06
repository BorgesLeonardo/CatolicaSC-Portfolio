# 🚀 Guia de Configuração - Backend

Este guia irá te ajudar a configurar o backend da plataforma de crowdfunding da Católica SC.

## 📋 Checklist de Configuração

### 1. ✅ Estrutura de Pastas Criada
```
backend/
├── src/
│   ├── config/         # Configurações do banco e app
│   ├── controllers/    # Controladores da API
│   ├── middleware/     # Middlewares (auth, validation, etc)
│   ├── routes/         # Definição das rotas
│   ├── services/       # Serviços de negócio
│   ├── utils/          # Utilitários
│   └── server.js       # Servidor principal
├── tests/              # Testes unitários e integração
├── prisma/             # Schema do banco de dados
├── .github/workflows/  # CI/CD com GitHub Actions
└── docker/             # Configurações Docker
```

### 2. ✅ Dependências Instaladas
- **Express.js** - Framework web
- **Prisma** - ORM para PostgreSQL
- **Clerk** - Autenticação
- **Jest** - Testes
- **Docker** - Containerização
- **ESLint/Prettier** - Qualidade de código

### 3. ✅ Banco de Dados Configurado
- Schema Prisma criado com todas as entidades
- Conexão com Supabase PostgreSQL configurada
- Migrações prontas para execução

### 4. ✅ API Endpoints Implementados
- **Autenticação**: `/api/auth/*`
- **Campanhas**: `/api/campaigns/*`
- **Doações**: `/api/donations/*`
- **Usuários**: `/api/users/*`
- **Health Check**: `/api/health/*`

### 5. ✅ Segurança Implementada
- Middleware de autenticação Clerk
- Validação de dados com express-validator
- Rate limiting
- Headers de segurança
- CORS configurado

### 6. ✅ CI/CD Configurado
- GitHub Actions workflow
- Testes automatizados
- Build e deploy com Docker
- Análise de segurança

## 🛠️ Próximos Passos

### 1. Configurar Variáveis de Ambiente
```bash
cd backend
cp env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
# Database
DATABASE_URL="postgresql://postgres:aYuGcvvO9Bz8K0uk@db.jbuozkvrslranpnjtsen.supabase.co:5432/postgres"

# Clerk (obtenha em https://clerk.com)
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_JWT_ISSUER=https://your-domain.clerk.accounts.dev

# Mercado Pago (obtenha em https://mercadopago.com.br)
MERCADO_PAGO_ACCESS_TOKEN=your_access_token
MERCADO_PAGO_PUBLIC_KEY=your_public_key

# JWT
JWT_SECRET=your_jwt_secret_key
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Banco de Dados
```bash
# Gerar cliente Prisma
npx prisma generate

# Sincronizar schema com o banco
npx prisma db push

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

### 4. Executar Testes
```bash
# Todos os testes
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Com cobertura
npm run test:coverage
```

### 5. Iniciar Servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 6. Testar API
```bash
# Health check
curl http://localhost:3000/api/health

# Listar campanhas
curl http://localhost:3000/api/campaigns
```

## 🐳 Docker (Opcional)

### Desenvolvimento
```bash
docker-compose up -d
```

### Produção
```bash
docker build -t catolica-sc-backend .
docker run -p 3000:3000 catolica-sc-backend
```

## 🔧 Comandos Úteis

```bash
# Linting
npm run lint
npm run lint:fix

# Formatação
npm run format

# Banco de dados
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio

# Docker
npm run docker:build
npm run docker:run
```

## 📊 Monitoramento

- **Health Check**: `GET /api/health`
- **Health Detalhado**: `GET /api/health/detailed`
- **Logs**: Console e arquivos de log
- **Métricas**: Uptime, memória, banco de dados

## 🚨 Troubleshooting

### Erro de Conexão com Banco
1. Verifique se a `DATABASE_URL` está correta
2. Confirme se o Supabase está acessível
3. Execute `npx prisma db push` novamente

### Erro de Autenticação Clerk
1. Verifique se as chaves do Clerk estão corretas
2. Confirme se o domínio está configurado no Clerk
3. Teste com um token válido

### Erro de Testes
1. Verifique se o banco de teste está configurado
2. Execute `npm run test:unit` primeiro
3. Verifique se todas as dependências estão instaladas

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do servidor
2. Execute os testes para identificar erros
3. Consulte a documentação da API
4. Abra uma issue no repositório

---

✅ **Backend configurado com sucesso!** 

Agora você pode começar a desenvolver o frontend ou testar a API.
