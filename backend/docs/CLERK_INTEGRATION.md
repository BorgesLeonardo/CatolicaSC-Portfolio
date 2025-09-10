# Integração Clerk - Backend

Este documento descreve a integração do Clerk com o backend da plataforma de crowdfunding.

## 🔐 Autenticação

### Middleware de Autenticação

O sistema utiliza o middleware `authenticateUser` para validar tokens JWT do Clerk:

```typescript
import { authenticateUser } from '../middleware/auth';

// Rota protegida
app.get('/api/protected', authenticateUser, (req, res) => {
  // req.user contém informações do usuário autenticado
  res.json({ user: req.user });
});
```

### Tipos de Middleware

1. **`authenticateUser`** - Obrigatório para rotas protegidas
2. **`optionalAuth`** - Opcional, adiciona usuário se autenticado
3. **`requireAdmin`** - Requer usuário autenticado com role admin

## 👤 Sincronização de Usuários

### Criação Automática

Quando um usuário se registra no Clerk, ele é automaticamente criado no banco de dados através de:

1. **Webhook do Clerk** - Sincronização em tempo real
2. **Middleware de autenticação** - Criação sob demanda

### Estrutura do Usuário

```typescript
interface User {
  id: string;           // UUID interno
  clerkUserId: string;  // ID do Clerk
  email: string;        // Email do usuário
  name?: string;        // Nome completo
  imageUrl?: string;    // URL do avatar
  role: 'user' | 'admin'; // Role do usuário
  createdAt: Date;      // Data de criação
  updatedAt: Date;      // Data de atualização
}
```

## 🔗 Endpoints da API

### Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/auth/me` | Informações do usuário | Obrigatória |
| GET | `/api/auth/profile` | Perfil completo com stats | Obrigatória |
| PUT | `/api/auth/profile` | Atualizar perfil | Obrigatória |
| GET | `/api/auth/users` | Listar usuários | Admin |
| GET | `/api/auth/check` | Verificar autenticação | Opcional |

### Webhooks

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/webhooks/clerk` | Webhook do Clerk |
| POST | `/api/webhooks/test` | Teste de webhook (dev) |

## 🛠️ Configuração

### Variáveis de Ambiente

```env
# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### Webhook no Clerk Dashboard

1. Acesse o [Clerk Dashboard](https://dashboard.clerk.com)
2. Vá em **Webhooks**
3. Crie um novo webhook com:
   - **URL**: `https://seu-dominio.com/api/webhooks/clerk`
   - **Eventos**: `user.created`, `user.updated`, `user.deleted`

## 📝 Exemplos de Uso

### Frontend (Vue.js)

```vue
<script setup>
import { useAuth } from '@clerk/vue';

const { getToken } = useAuth();

const fetchUserProfile = async () => {
  const token = await getToken();
  
  const response = await fetch('/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};
</script>
```

### Backend (Node.js)

```typescript
// Rota protegida
app.get('/api/campaigns', authenticateUser, async (req, res) => {
  const userId = req.user!.id;
  
  const campaigns = await prisma.campaign.findMany({
    where: { creatorId: userId }
  });
  
  res.json(campaigns);
});
```

## 🔒 Segurança

### Validação de Token

- Tokens JWT são validados usando a chave secreta do Clerk
- Tokens expirados são rejeitados automaticamente
- Assinatura é verificada para prevenir falsificação

### Webhook Security

- Assinatura do webhook é verificada usando `svix`
- Headers obrigatórios: `svix-id`, `svix-timestamp`, `svix-signature`
- Eventos são registrados no banco para auditoria

## 🧪 Testes

### Scripts de Teste

```bash
# Testar integração completa
npm run test:clerk

# Testar conexão com banco
npm run test:connection

# Testar webhook (desenvolvimento)
curl -X POST http://localhost:3000/api/webhooks/test
```

### Teste Manual

1. **Criar usuário no Clerk**
2. **Verificar sincronização no banco**
3. **Testar autenticação com token**
4. **Verificar endpoints protegidos**

## 🚀 Próximos Passos

1. **Configurar webhook no Clerk Dashboard**
2. **Implementar rotas de campanhas**
3. **Adicionar sistema de permissões**
4. **Implementar cache de usuários**
5. **Adicionar logs de auditoria**

## 📚 Referências

- [Clerk Vue.js Documentation](https://clerk.com/docs/quickstarts/vue)
- [Clerk Backend SDK](https://clerk.com/docs/backend-requests)
- [Webhook Documentation](https://clerk.com/docs/webhooks)

