# Autenticação com Clerk

Este documento descreve como a autenticação está implementada no backend da Plataforma de Crowdfunding.

## 🔐 Configuração

### Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.envlocal`:

```env
# Clerk Authentication Configuration
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key_here"
CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key_here"
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

### Webhook do Clerk

Configure o webhook no painel do Clerk para:
```
POST http://localhost:3000/api/auth/webhook
```

Eventos suportados:
- `user.created` - Cria usuário no banco quando registrado no Clerk
- `user.updated` - Atualiza dados do usuário no banco
- `user.deleted` - Remove usuário do banco

## 🛠️ Funcionalidades Implementadas

### 1. Middleware de Autenticação

#### `authenticateUser`
Valida JWT do Clerk e sincroniza usuário com banco de dados.

```javascript
import { authenticateUser } from '../middleware/auth.js';

app.get('/protected-route', authenticateUser, (req, res) => {
  // req.user contém dados do usuário
  // req.clerkUserId contém o ID do Clerk
});
```

#### `optionalAuth`
Middleware opcional para rotas que podem ou não ter autenticação.

```javascript
import { optionalAuth } from '../middleware/auth.js';

app.get('/public-route', optionalAuth, (req, res) => {
  if (req.user) {
    // Usuário autenticado
  } else {
    // Usuário não autenticado
  }
});
```

#### `requireAdmin`
Verifica se o usuário é administrador.

```javascript
import { requireAdmin } from '../middleware/auth.js';

app.get('/admin-route', authenticateUser, requireAdmin, (req, res) => {
  // Apenas administradores
});
```

### 2. Sincronização de Usuários

#### Criação Automática
Quando um usuário se registra no Clerk, o webhook automaticamente:
1. Busca dados do usuário no Clerk
2. Cria registro na tabela `users` do banco
3. Define role padrão como `USER`

#### Atualização Automática
Quando dados do usuário são atualizados no Clerk:
1. Webhook recebe evento `user.updated`
2. Busca dados atualizados no Clerk
3. Atualiza registro no banco de dados

#### Remoção Automática
Quando usuário é deletado no Clerk:
1. Webhook recebe evento `user.deleted`
2. Remove usuário do banco (cascade delete)

### 3. Rotas de Autenticação

#### `GET /api/auth/profile`
Retorna perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Resposta:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "imageUrl": "https://...",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "campaigns": [...],
  "contributions": [...]
}
```

#### `PUT /api/auth/profile`
Atualiza perfil do usuário.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "name": "Novo Nome",
  "imageUrl": "https://nova-imagem.com"
}
```

#### `POST /api/auth/sync`
Sincroniza usuário manualmente (útil para testes).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### `GET /api/auth/status`
Verifica status da autenticação.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### `GET /api/auth/stats`
Retorna estatísticas do usuário.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Resposta:**
```json
{
  "campaigns": {
    "created": 5
  },
  "contributions": {
    "made": 10,
    "totalAmount": 1500.00
  }
}
```

#### `POST /api/auth/webhook`
Endpoint para webhooks do Clerk (não requer autenticação).

## 🔄 Fluxo de Autenticação

1. **Frontend** envia JWT do Clerk no header `Authorization: Bearer <token>`
2. **Middleware** valida JWT com Clerk
3. **Sistema** busca ou cria usuário no banco de dados
4. **Request** recebe `req.user` com dados do usuário
5. **Rota** processa requisição com contexto do usuário

## 🗄️ Estrutura do Banco

### Tabela `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image_url TEXT,
  role user_role DEFAULT 'USER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enum `user_role`
```sql
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
```

## 🧪 Testando a Autenticação

### 1. Configurar Clerk
1. Crie uma conta no [Clerk](https://clerk.com)
2. Crie uma aplicação
3. Copie as chaves para `.envlocal`
4. Configure webhook para `http://localhost:3000/api/auth/webhook`

### 2. Testar com cURL
```bash
# Testar status (sem token)
curl http://localhost:3000/api/auth/status

# Testar com token válido
curl -H "Authorization: Bearer <jwt_token>" http://localhost:3000/api/auth/profile
```

### 3. Executar Testes
```bash
# Testar configuração
node src/scripts/test-clerk.js

# Iniciar servidor
npm run dev
```

## 🔒 Segurança

- JWT tokens são validados com Clerk
- Webhooks são verificados com assinatura
- Usuários são sincronizados automaticamente
- Dados sensíveis não são expostos
- Middleware protege rotas sensíveis

## 📝 Logs

O sistema registra:
- Criação de usuários
- Atualizações de perfil
- Erros de autenticação
- Eventos de webhook
- Sincronizações

## 🚀 Próximos Passos

1. ✅ ~~Configurar Clerk~~
2. ✅ ~~Implementar middleware de autenticação~~
3. ✅ ~~Criar sincronização de usuários~~
4. ✅ ~~Implementar webhooks~~
5. Integrar com rotas de campanhas
6. Adicionar autorização por roles
7. Implementar rate limiting
