# CatólicaSC Portfolio - Frontend

Frontend da plataforma de crowdfunding desenvolvido com Quasar + Vue 3 + TypeScript.

## 🚀 Tecnologias

- **Quasar Framework** - UI Framework baseado em Vue.js
- **Vue 3** - Framework JavaScript reativo
- **TypeScript** - Superset tipado do JavaScript
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento
- **Clerk** - Autenticação
- **Stripe** - Pagamentos
- **Axios** - Cliente HTTP

## 🎨 Design System

### Cores
- **Primary**: #4f46e5 (Indigo)
- **Secondary**: #22c55e (Green)
- **Accent**: #8b5cf6 (Purple)
- **Positive**: #22c55e (Green)
- **Negative**: #ef4444 (Red)
- **Info**: #3b82f6 (Blue)
- **Warning**: #f59e0b (Amber)

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif

### Componentes Base
- `UiEmptyState` - Estado vazio com ícone, título e descrição
- `UiProgress` - Barra de progresso com label e percentual
- `ProjectCard` - Card de campanha reutilizável

## 🛠️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# API Configuration
VITE_API_BASE_URL=http://localhost:3333

# Stripe Payment
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

## 📱 Funcionalidades

### ✅ Implementadas
- [x] Design system com tokens de cores e tipografia
- [x] Layout responsivo com AppLayout (header + drawer)
- [x] Componentes UI reutilizáveis
- [x] Autenticação com Clerk
- [x] Listagem de campanhas (próprias e apoiadas)
- [x] Wizard de criação de campanhas
- [x] Diálogo de contribuição com Stripe
- [x] Páginas de retorno do checkout
- [x] Acessibilidade (ARIA labels, foco visível, contraste)
- [x] Responsividade (mobile-first)
- [x] Estados de loading e erro
- [x] Dark mode (automático)

### 🔄 Fluxo de Contribuição
1. Usuário clica em "Contribuir" na página de detalhes
2. Diálogo abre com valores pré-definidos ou customizado
3. Validação do valor mínimo (R$ 5,00)
4. Redirecionamento para Stripe Checkout
5. Processamento do pagamento
6. Webhook atualiza dados no backend
7. Retorno para página de sucesso/cancelamento

## 🎯 Padrões de Desenvolvimento

### Componentes
- Use `script setup` + TypeScript
- Props tipadas com interfaces
- Emits tipados
- Slots para customização

### Estilos
- SCSS com variáveis do Quasar
- Classes utilitárias para reutilização
- Mobile-first approach
- Suporte a dark mode

### Estados
- Loading: `QSkeleton` para carregamento
- Vazio: `UiEmptyState` com ação
- Erro: Notificação + botão de retry

### Acessibilidade
- ARIA labels em botões icônicos
- Foco visível em elementos interativos
- Contraste AA mínimo
- Suporte a leitores de tela
- Navegação por teclado

## 🧪 Testes

```bash
# Executar testes
npm run test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📦 Build e Deploy

```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🔧 Configuração do Stripe

1. Crie uma conta no [Stripe](https://stripe.com)
2. Obtenha as chaves de API (test/live)
3. Configure o webhook endpoint: `https://seu-dominio.com/api/webhooks/stripe`
4. Eventos necessários: `checkout.session.completed`

## 🔧 Configuração do Clerk

1. Crie uma conta no [Clerk](https://clerk.com)
2. Configure o domínio da aplicação
3. Obtenha a chave pública
4. Configure as URLs de redirecionamento

## 📚 Documentação

- [Quasar Framework](https://quasar.dev)
- [Vue 3](https://vuejs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Clerk](https://clerk.com/docs)
- [Stripe](https://stripe.com/docs)