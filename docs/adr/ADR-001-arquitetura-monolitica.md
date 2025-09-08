# ADR-001: Arquitetura Monolítica com Separação Frontend/Backend

## Status
Aceito

## Contexto
O projeto de crowdfunding da Católica SC precisa de uma arquitetura que seja:
- Simples de desenvolver e manter
- Fácil de fazer deploy
- Escalável para o volume esperado de usuários
- Compatível com a equipe de desenvolvimento disponível

## Decisão
Adotar uma arquitetura monolítica com separação clara entre frontend e backend:

### Frontend
- **Framework**: Quasar (Vue 3) + TypeScript
- **Padrão**: SPA (Single Page Application)
- **Autenticação**: Clerk
- **Gerenciamento de Estado**: Pinia
- **Roteamento**: Vue Router

### Backend
- **Framework**: Express.js + TypeScript
- **Padrão**: API REST
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: Clerk (integração)
- **Pagamentos**: Mercado Pago

### Infraestrutura
- **Containerização**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deploy**: Monorepo com builds separados

## Alternativas Consideradas

### 1. Microserviços
**Prós:**
- Escalabilidade independente
- Tecnologias diferentes por serviço
- Isolamento de falhas

**Contras:**
- Complexidade de desenvolvimento
- Overhead de comunicação
- Dificuldade de debugging
- Equipe pequena para manter

### 2. Server-Side Rendering (Next.js/Nuxt)
**Prós:**
- SEO melhor
- Performance inicial
- Aplicação única

**Contras:**
- Acoplamento frontend/backend
- Menos flexibilidade
- Dificuldade para mobile futuro

### 3. Arquitetura Atual (Monolítica Separada)
**Prós:**
- Simplicidade de desenvolvimento
- Deploy independente
- Fácil manutenção
- Boa separação de responsabilidades
- Escalável horizontalmente

**Contras:**
- Duas aplicações para manter
- Possível duplicação de código

## Consequências

### Positivas
- Desenvolvimento mais rápido
- Facilidade para novos desenvolvedores
- Deploy independente de frontend e backend
- Boa separação de responsabilidades
- Fácil de testar individualmente

### Negativas
- Duas aplicações para manter
- Possível duplicação de tipos/interfaces
- Necessidade de sincronização entre frontend e backend

## Implementação
- Frontend e backend em pastas separadas
- Compartilhamento de tipos via package separado (futuro)
- API REST bem documentada (OpenAPI)
- Docker para containerização
- GitHub Actions para CI/CD

## Revisão
Esta decisão será revisada quando:
- O volume de usuários exigir microserviços
- A equipe crescer significativamente
- Surgirem necessidades específicas de escalabilidade
