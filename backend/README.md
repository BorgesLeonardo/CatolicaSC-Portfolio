# Crowdfunding Backend - Católica SC

Backend da plataforma de crowdfunding desenvolvido com Node.js, Express, Prisma e PostgreSQL (Supabase).

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para PostgreSQL
- **Supabase** - PostgreSQL em nuvem
- **Clerk** - Autenticação e gerenciamento de usuários
- **Stripe** - Processamento de pagamentos

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase
- Conta no Clerk
- Conta no Stripe

## 🛠️ Instalação

1. **Clone o repositório e navegue para o diretório backend:**
   ```bash
   cd backend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp env.example .env
   ```
   
   Edite o arquivo `.env` com suas credenciais:
   - `DATABASE_URL`: URL de conexão do Supabase PostgreSQL
   - `CLERK_SECRET_KEY`: Chave secreta do Clerk
   - `STRIPE_SECRET_KEY`: Chave secreta do Stripe

4. **Configure o banco de dados no Supabase:**
   
   Execute o seguinte SQL no Supabase SQL Editor para criar o usuário Prisma:
   ```sql
   -- Create custom user for Prisma
   CREATE USER "prisma" WITH PASSWORD 'custom_password' BYPASSRLS CREATEDB;
   
   -- Extend prisma's privileges to postgres
   GRANT "prisma" TO "postgres";
   
   -- Grant necessary permissions
   GRANT USAGE ON SCHEMA public TO prisma;
   GRANT CREATE ON SCHEMA public TO prisma;
   GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
   GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
   GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;
   
   -- Set default privileges
   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
   ```

5. **Execute as migrações do Prisma:**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Gere o cliente Prisma:**
   ```bash
   npx prisma generate
   ```

## 🧪 Testando a Conexão

Para testar se a conexão com o banco está funcionando:

```bash
npm run dev
```

Ou execute o script de teste:

```bash
npx ts-node src/scripts/test-connection.ts
```

## 📚 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Inicia o servidor em produção
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate` - Executa migrações
- `npm run prisma:studio` - Abre o Prisma Studio
- `npm run prisma:push` - Sincroniza schema com o banco
- `npm test` - Executa testes
- `npm run lint` - Executa linter

## 🔧 Configuração do Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto
3. Vá em Settings > Database
4. Copie a connection string (Session mode)
5. Substitua `[DB-USER]` por `prisma` e `[PRISMA-PASSWORD]` pela senha criada
6. Cole no arquivo `.env` como `DATABASE_URL`

## 📊 Estrutura do Banco

O banco de dados inclui as seguintes tabelas:

- **users** - Usuários (integração com Clerk)
- **categories** - Categorias de campanhas
- **campaigns** - Campanhas de crowdfunding
- **contributions** - Contribuições financeiras
- **comments** - Comentários nas campanhas
- **webhook_events** - Eventos de webhook (Stripe)

## 🔐 Segurança

- Autenticação via Clerk (JWT tokens)
- Validação de tokens em rotas protegidas
- Rate limiting para prevenir abuso
- CORS configurado
- Helmet para headers de segurança
- Validação de dados com express-validator

## 📝 Próximos Passos

1. Configurar autenticação com Clerk
2. Implementar rotas de API
3. Integrar Stripe para pagamentos
4. Implementar sistema de comentários
5. Adicionar testes automatizados

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.

