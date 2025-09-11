# Crowdfunding Platform

Uma plataforma moderna de crowdfunding construída com Vue.js/Quasar no frontend e Node.js/Express no backend.

## 🚀 Funcionalidades

- ✅ **Autenticação segura** com Clerk
- ✅ **Criação de campanhas** com categorias predefinidas
- ✅ **Sistema de contribuições** com Stripe
- ✅ **Filtragem por categorias** e status
- ✅ **Dashboard do usuário** para gerenciar campanhas
- ✅ **Sistema de comentários** nas campanhas
- ✅ **Interface responsiva** e moderna
- ✅ **Validação completa** de dados

## 🏗️ Tecnologias

### Frontend
- **Vue.js 3** + **Quasar Framework**
- **TypeScript**
- **Clerk** para autenticação
- **Axios** para requisições HTTP

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **Stripe** para pagamentos
- **Zod** para validação

## 📦 Estrutura do Projeto

```
├── frontend/          # Aplicação Vue.js/Quasar
├── backend/           # API Node.js/Express
└── imagens/           # Documentação e diagramas
```

## 🛠️ Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Contas no Clerk e Stripe

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure suas variáveis
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # Configure suas variáveis
npm run dev
```

## 📊 Categorias de Campanhas

- 🎓 **Educação** - Cursos, materiais didáticos
- ❤️ **Saúde** - Tratamentos médicos, equipamentos
- ⚽ **Esportes** - Atletas, equipamentos esportivos
- 🎨 **Cultura** - Arte, música, teatro
- 💻 **Tecnologia** - Projetos de inovação, startups
- 🌱 **Meio Ambiente** - Sustentabilidade, preservação
- 🐾 **Animais** - Proteção animal, ONGs
- 🚨 **Emergência** - Situações urgentes
- 👥 **Comunidade** - Projetos sociais
- 📂 **Outros** - Demais categorias

## 🔒 Campos Obrigatórios

Para criar uma campanha, todos os campos abaixo são obrigatórios:
- **Título** (3-120 caracteres)
- **Descrição** (10-5000 caracteres)  
- **Categoria** (uma das predefinidas)
- **Meta** (valor positivo em reais)
- **Data limite** (presente ou futura)

## 📄 Licença

Este projeto está sob a licença MIT.
