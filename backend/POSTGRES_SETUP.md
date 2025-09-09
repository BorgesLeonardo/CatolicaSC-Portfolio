# Configuração do Postgres com Supabase

Este documento explica como configurar e usar a conexão direta com o Supabase usando o pacote `postgres`.

## ✅ Configuração Concluída

A integração com o Supabase via postgres foi configurada com sucesso! Os seguintes arquivos foram criados/modificados:

### Arquivos Criados:
- `src/db/connection.ts` - Configuração da conexão postgres
- `src/db/examples.ts` - Exemplos de uso do postgres
- `POSTGRES_SETUP.md` - Esta documentação

### Arquivos Modificados:
- `env.example` - Atualizado com URLs do Supabase
- `prisma/schema.prisma` - Adicionado directUrl
- `src/db/index.ts` - Integração entre Prisma e postgres
- `src/index.ts` - Teste de conexão atualizado
- `package.json` - Dependência postgres adicionada

## 🔧 Configuração das Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Banco de dados - Supabase
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.jbuozkvrslranpnjtsen:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.jbuozkvrslranpnjtsen:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

## 🚀 Como Usar

### 1. Importar o cliente postgres

```typescript
import { sql } from './db'
```

### 2. Consultas básicas

```typescript
// Buscar dados
const campaigns = await sql`
  SELECT * FROM campaigns 
  WHERE status = 'ACTIVE'
`

// Inserir dados
const result = await sql`
  INSERT INTO contributions (amount, user_id, campaign_id)
  VALUES (100, 'user-id', 'campaign-id')
  RETURNING *
`
```

### 3. Usar exemplos pré-definidos

```typescript
import { DatabaseExamples } from './db/examples'

// Buscar campanhas ativas
const activeCampaigns = await DatabaseExamples.getActiveCampaigns()

// Buscar estatísticas de uma campanha
const stats = await DatabaseExamples.getCampaignStats('campaign-id')

// Buscar contribuições recentes
const recentContributions = await DatabaseExamples.getRecentContributions(5)
```

## 🧪 Testando a Conexão

Execute o servidor para testar as conexões:

```bash
npm run dev
```

Você verá no console se as conexões com Prisma e postgres foram estabelecidas com sucesso.

## 📋 Vantagens desta Abordagem

1. **Conexão Direta**: Acesso direto ao banco PostgreSQL do Supabase
2. **Performance**: Sem overhead do cliente Supabase
3. **Flexibilidade**: Consultas SQL completas e personalizadas
4. **Compatibilidade**: Funciona perfeitamente com Prisma
5. **Simplicidade**: Configuração mínima e direta

## 🔗 Recursos Úteis

- [Documentação do postgres](https://github.com/porsager/postgres)
- [Documentação do Supabase](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## ⚠️ Notas Importantes

- Use `DATABASE_URL` para operações normais (com pooling)
- Use `DIRECT_URL` para migrações do Prisma
- O postgres é ideal para consultas complexas e relatórios
- O Prisma continua sendo recomendado para operações CRUD básicas
- Certifique-se de que as tabelas no Supabase correspondem ao schema do Prisma
