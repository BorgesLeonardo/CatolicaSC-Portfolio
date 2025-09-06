# Católica SC Portfolio - Backend

Backend da plataforma de crowdfunding da Católica SC, desenvolvido com Node.js, Express e PostgreSQL.

## 🚀 Tecnologias

- **Node.js 18+** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM para Node.js
- **Clerk** - Autenticação e gerenciamento de usuários
- **Mercado Pago** - Processamento de pagamentos
- **Docker** - Containerização
- **Jest** - Testes unitários e de integração

## 📋 Pré-requisitos

- Node.js 18 ou superior
- npm 8 ou superior
- PostgreSQL (ou Supabase)
- Docker (opcional)

## 🛠️ Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/BorgesLeonardo/CatolicaSC-Portfolio.git
   cd CatolicaSC-Portfolio/backend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   DATABASE_URL="postgresql://postgres:aYuGcvvO9Bz8K0uk@db.jbuozkvrslranpnjtsen.supabase.co:5432/postgres"
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   # ... outras variáveis
   ```

4. **Configure o banco de dados**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Inicie o servidor**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm start
   ```

## 🐳 Docker

### Desenvolvimento
```bash
docker-compose up -d
```

### Produção
```bash
docker build -t catolica-sc-backend .
docker run -p 3000:3000 catolica-sc-backend
```

## 🧪 Testes

```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Cobertura de código
npm run test:coverage
```

## 📚 API Endpoints

### Autenticação
- `GET /api/auth/me` - Perfil do usuário
- `PUT /api/auth/me` - Atualizar perfil

### Campanhas
- `GET /api/campaigns` - Listar campanhas
- `GET /api/campaigns/:id` - Detalhes da campanha
- `POST /api/campaigns` - Criar campanha (autenticado)
- `PUT /api/campaigns/:id` - Atualizar campanha (autenticado)
- `DELETE /api/campaigns/:id` - Deletar campanha (autenticado)

### Doações
- `POST /api/donations` - Criar doação (autenticado)
- `GET /api/donations/my` - Minhas doações (autenticado)
- `GET /api/donations/campaign/:id` - Doações da campanha

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/campaigns` - Campanhas do usuário
- `GET /api/users/donations` - Doações do usuário
- `GET /api/users/stats` - Estatísticas do usuário

### Health Check
- `GET /api/health` - Status básico
- `GET /api/health/detailed` - Status detalhado

## 🔧 Scripts Disponíveis

```bash
npm start          # Iniciar em produção
npm run dev        # Iniciar em desenvolvimento
npm test           # Executar testes
npm run lint       # Verificar código
npm run lint:fix   # Corrigir problemas de lint
npm run format     # Formatar código
npm run db:generate # Gerar cliente Prisma
npm run db:push    # Sincronizar schema
npm run db:migrate # Executar migrações
npm run db:studio  # Abrir Prisma Studio
```

## 🏗️ Arquitetura

```
src/
├── config/         # Configurações
├── controllers/    # Controladores
├── middleware/     # Middlewares
├── routes/         # Rotas da API
├── services/       # Serviços de negócio
├── utils/          # Utilitários
└── server.js       # Servidor principal
```

## 🔒 Segurança

- Autenticação via Clerk
- Validação de dados com Joi
- Rate limiting
- CORS configurado
- Headers de segurança com Helmet
- Validação de entrada com express-validator

## 📊 Monitoramento

- Health checks
- Logs estruturados
- Métricas de performance
- Tratamento de erros centralizado

## 🚀 Deploy

O projeto está configurado com GitHub Actions para CI/CD:

1. **Testes** - Executados em cada PR
2. **Build** - Docker image criada
3. **Deploy** - Deploy automático para produção

## 📝 Licença

MIT License - veja o arquivo [LICENSE](../LICENSE) para detalhes.

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
