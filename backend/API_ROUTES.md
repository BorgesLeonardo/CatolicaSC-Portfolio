# API Routes - CatólicaSC Portfolio Backend

Este documento descreve todas as rotas implementadas no backend seguindo a especificação técnica e aplicando TDD (Test-Driven Development).

## Estrutura das Rotas

### 1. Campanhas (`/api/campaigns`)

**RF03, RF04, RF05, RF06** - Criação, edição, listagem e visualização de campanhas

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/campaigns` | Lista todas as campanhas ativas com paginação | Não |
| GET | `/api/campaigns/:id` | Obtém detalhes de uma campanha específica | Não |
| POST | `/api/campaigns` | Cria uma nova campanha | Sim |
| PUT | `/api/campaigns/:id` | Atualiza uma campanha (apenas autor) | Sim |
| DELETE | `/api/campaigns/:id` | Exclui uma campanha (apenas autor) | Sim |

**Exemplo de criação de campanha:**
```json
POST /api/campaigns
{
  "title": "Campanha de Financiamento",
  "description": "Descrição da campanha",
  "goal": 10000.00,
  "deadline": "2024-12-31T23:59:59Z",
  "imageUrl": "https://example.com/image.jpg",
  "categoryId": "categoria-id"
}
```

### 2. Apoios (`/api/supports`)

**RF07, RF08** - Sistema de apoio a campanhas

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/supports/campaign/:campaignId` | Lista apoios de uma campanha | Não |
| GET | `/api/supports/user` | Lista apoios do usuário autenticado | Sim |
| POST | `/api/supports` | Cria um novo apoio | Sim |

**Exemplo de criação de apoio:**
```json
POST /api/supports
{
  "campaignId": "campaign-id",
  "amount": 50.00,
  "message": "Ótima causa!",
  "isAnonymous": false
}
```

### 3. Comentários (`/api/comments`)

**RF11** - Sistema de comentários nas campanhas

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/comments/campaign/:campaignId` | Lista comentários de uma campanha | Não |
| POST | `/api/comments` | Cria um novo comentário | Sim |
| PUT | `/api/comments/:id` | Atualiza um comentário (apenas autor) | Sim |
| DELETE | `/api/comments/:id` | Exclui um comentário (apenas autor) | Sim |

**Exemplo de criação de comentário:**
```json
POST /api/comments
{
  "campaignId": "campaign-id",
  "content": "Excelente campanha!"
}
```

### 4. Usuários (`/api/users`)

**RF01, RF02, RF09** - Gerenciamento de usuários e dashboard

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/api/users` | Cria um novo usuário | Sim |
| GET | `/api/users/profile` | Obtém perfil do usuário autenticado | Sim |
| GET | `/api/users/dashboard` | Obtém dashboard do usuário | Sim |
| PUT | `/api/users/profile` | Atualiza perfil do usuário | Sim |

**Exemplo de criação de usuário:**
```json
POST /api/users
{
  "clerkId": "clerk-user-id",
  "email": "user@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "imageUrl": "https://example.com/avatar.jpg"
}
```

### 5. Pagamentos (`/api/payments`)

**RF10** - Geração de QR Code para pagamento

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/api/payments/qr-code` | Gera QR Code para pagamento | Sim |
| POST | `/api/payments/confirm` | Confirma pagamento | Sim |
| GET | `/api/payments/status/:paymentId` | Obtém status do pagamento | Sim |

**Exemplo de geração de QR Code:**
```json
POST /api/payments/qr-code
{
  "campaignId": "campaign-id",
  "amount": 100.00,
  "description": "Apoio para campanha"
}
```

## Autenticação

Todas as rotas protegidas requerem um token JWT do Clerk no header:
```
Authorization: Bearer <jwt-token>
```

## Resposta Padrão

Todas as rotas seguem o padrão de resposta:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Não autorizado
- `404` - Recurso não encontrado
- `409` - Conflito (ex: email já existe)
- `500` - Erro interno do servidor

## Validações Implementadas

### Campanhas
- Título, descrição, meta e prazo são obrigatórios
- Meta deve ser um número positivo
- Prazo deve ser uma data futura
- Apenas o autor pode editar/excluir suas campanhas

### Apoios
- ID da campanha e valor são obrigatórios
- Valor deve ser positivo
- Campanha deve existir e estar ativa
- Prazo da campanha não pode ter passado

### Comentários
- ID da campanha e conteúdo são obrigatórios
- Conteúdo não pode estar vazio
- Apenas o autor pode editar/excluir seus comentários

### Usuários
- Clerk ID e email são obrigatórios
- Email deve ter formato válido
- Email deve ser único

### Pagamentos
- ID da campanha e valor são obrigatórios
- Valor deve ser positivo
- Campanha deve existir e estar ativa

## Testes

Todos os controllers possuem testes unitários completos que cobrem:
- Casos de sucesso
- Validações de entrada
- Autenticação e autorização
- Tratamento de erros
- Códigos de status HTTP

Para executar os testes:
```bash
npm test
```

## Tecnologias Utilizadas

- **Node.js** com **Express**
- **TypeScript** para tipagem estática
- **Prisma** como ORM
- **PostgreSQL** via Supabase
- **Clerk** para autenticação
- **Jest** para testes
- **QRCode** para geração de QR codes
- **Supertest** para testes de API
