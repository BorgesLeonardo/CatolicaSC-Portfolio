# Católica SC Crowdfunding

Sistema de crowdfunding para a Universidade Católica de Santa Catarina, desenvolvido como projeto de conclusão de curso.

**Estudante**: Leonardo Pereira Borges  
**Curso**: Engenharia de Software  
**Data de Entrega**: 29/11/2025

## 🏗️ Arquitetura

Este é um monorepo contendo:

- **Frontend**: Quasar (Vue 3) + TypeScript + Clerk
- **Backend**: Express.js + TypeScript + Prisma + PostgreSQL
- **Infraestrutura**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## 📁 Estrutura do Projeto

```
catolica-sc-crowdfunding/
├─ frontend/                     # Quasar (Vue 3) + Clerk (SPA)
├─ backend/                      # Express + Prisma + validação Clerk + integrações externas
├─ docs/                         # Diagramas C4, especificações, OpenAPI e ADRs
├─ infra/                        # Docker, Compose, scripts de provisionamento
├─ .github/workflows/            # Pipelines CI (lint, build, testes, migrate)
├─ .editorconfig
├─ .gitignore
└─ README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ ou 20+
- Docker e Docker Compose
- PostgreSQL (ou usar Docker)

### Desenvolvimento Local

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd catolica-sc-crowdfunding
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edite o arquivo .env com suas configurações
   ```

3. **Execute com Docker Compose**
   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```

4. **Ou execute localmente**
   ```bash
   # Backend
   cd backend
   npm install
   npm run db:migrate
   npm run dev

   # Frontend (em outro terminal)
   cd frontend
   npm install
   npm run dev
   ```

## 📚 Documentação

- [Arquitetura](docs/architecture/)
- [API](docs/api/)
- [ADRs](docs/adr/)
- [CI/CD e Qualidade](docs/ci-cd/)
- [Regras de Qualidade](docs/quality/)

## 🔍 Análise de Qualidade

O projeto utiliza SonarQube para análise de qualidade de código com os seguintes critérios:

### Cobertura de Código
- **Mínimo**: 80% de cobertura de linhas
- **Branches**: 80% de cobertura de branches
- **Functions**: 80% de cobertura de funções

### Qualidade
- **Duplicação**: Máximo 3% de código duplicado
- **Complexidade**: Máximo 10 por função
- **Vulnerabilidades**: 0 críticas/altas permitidas
- **Code Smells**: Máximo 5 altos

### Configuração Local do SonarQube

```bash
# Iniciar SonarQube localmente
cd infra/scripts
chmod +x setup-sonar.sh
./setup-sonar.sh

# Acessar: http://localhost:9000
# Usuário: admin / Senha: admin
```

## 🚀 CI/CD Pipeline

Sistema CI/CD simples e eficiente com:

- **Análise de Qualidade**: SonarQube + ESLint
- **Testes**: Unitários e Integração
- **Deploy**: Automático para staging, manual para production

### Workflows Disponíveis

1. **Build** (`.github/workflows/build.yml`)
   - Executa em push/PR para main
   - Análise SonarQube (se token configurado)
   - Lint, build e testes

2. **Test** (`.github/workflows/test.yml`)
   - Executa em push/PR para main/develop
   - Testes unitários e de integração
   - Banco de dados de teste

3. **Deploy** (`.github/workflows/deploy.yml`)
   - Executa em push para main
   - Deploy automático para staging
   - Deploy manual para production

### Configuração Rápida

1. **Configure os secrets no GitHub**:
   ```
   SONAR_TOKEN=<seu-token-sonar>
   SONAR_HOST_URL=https://sonarcloud.io
   ```

2. **Faça push para main**:
   ```bash
   git push origin main
   ```

3. **Monitore a qualidade**:
   - Acesse o SonarQube
   - Verifique os workflows no GitHub Actions

### Troubleshooting

Se houver problemas com os workflows, consulte:
- [Troubleshooting CI/CD](docs/ci-cd/troubleshooting.md)
- [Configuração](docs/ci-cd/setup.md)

## 🛠️ Scripts Disponíveis

### Backend
- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Compila o projeto
- `npm run db:migrate` - Executa migrações
- `npm run db:seed` - Popula o banco com dados de exemplo
- `npm test` - Executa testes
- `npm run test:coverage` - Executa testes com cobertura
- `npm run test:integration` - Executa testes de integração
- `npm run test:unit` - Executa testes unitários
- `npm run lint` - Executa linter
- `npm run sonar` - Executa análise SonarQube

### Frontend
- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Compila o projeto
- `npm run test:unit` - Executa testes unitários
- `npm run test:coverage` - Executa testes com cobertura
- `npm run lint` - Executa linter
- `npm run sonar` - Executa análise SonarQube

## 🔧 Tecnologias

### Frontend
- Vue 3 + Composition API
- Quasar Framework
- TypeScript
- Pinia (Gerenciamento de Estado)
- Vue Router
- Clerk (Autenticação)
- Axios (HTTP Client)

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Clerk (Autenticação)
- Mercado Pago (Pagamentos)
- Zod (Validação)
- Pino (Logging)

### Infraestrutura
- Docker + Docker Compose
- GitHub Actions
- PostgreSQL

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Contato

- **Equipe de Desenvolvimento**: dev@catolicasc.edu.br
- **Universidade Católica de Santa Catarina**: [Site Oficial](https://www.catolicasc.edu.br)

## 📋 Documentação Adicional

- [Descrição do Projeto](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/Descri%C3%A7%C3%A3o-Projeto)
- [Especificação Técnica](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/Especifica%C3%A7%C3%A3o-T%C3%A9cnica)
- [Próximos Passos](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/Pr%C3%B3ximos-Passos)