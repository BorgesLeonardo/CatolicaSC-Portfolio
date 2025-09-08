# C4 Model - Container Diagram

## Arquitetura de Containers

### Frontend (SPA)
- **Tecnologia**: Quasar (Vue 3) + TypeScript
- **Responsabilidades**:
  - Interface do usuário
  - Gerenciamento de estado (Pinia)
  - Roteamento (Vue Router)
  - Autenticação (Clerk)
  - Comunicação com API

### Backend (API)
- **Tecnologia**: Express.js + TypeScript
- **Responsabilidades**:
  - API REST
  - Lógica de negócio
  - Validação de dados
  - Integração com serviços externos
  - Gerenciamento de banco de dados

### Banco de Dados
- **Tecnologia**: PostgreSQL
- **Responsabilidades**:
  - Armazenamento de dados
  - Relacionamentos entre entidades
  - Migrações e versionamento

### Serviços Externos
- **Clerk**: Autenticação e autorização
- **Mercado Pago**: Processamento de pagamentos
- **Serviço de E-mail**: Notificações (opcional)

### Comunicação
- **Frontend ↔ Backend**: HTTP/HTTPS via API REST
- **Backend ↔ Banco**: Conexão direta via Prisma ORM
- **Backend ↔ Serviços Externos**: APIs REST/Webhooks
