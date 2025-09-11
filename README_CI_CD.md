# CI/CD Pipeline - Catolica SC Portfolio

Este documento descreve a configuração e uso do pipeline de CI/CD implementado para o projeto Catolica SC Portfolio.

## 📋 Visão Geral

O pipeline implementado inclui:
- **CI (Continuous Integration)**: Lint, testes, cobertura e análise SonarQube
- **CD (Continuous Deployment)**: Build e push de imagens Docker + deploy automático
- **Quality Gate**: Bloqueio de deploy se análise de qualidade falhar

## 🔧 Configuração Inicial

### 1. Secrets do GitHub

Configure os seguintes secrets no repositório GitHub (`Settings > Secrets and variables > Actions`):

#### Obrigatórios:
- `SONAR_TOKEN`: Token de autenticação do SonarQube/SonarCloud
- `SONAR_HOST_URL`: URL do SonarQube (ex: `https://sonarcloud.io`)

#### Opcionais (para deploy):
- `SSH_HOST`: Host do servidor de produção (para deploy via SSH)
- `SSH_USER`: Usuário SSH para deploy
- `SSH_KEY`: Chave privada SSH
- `DATABASE_URL`: URL do banco de dados de produção
- `CLERK_SECRET_KEY`: Chave secreta do Clerk
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe
- `VITE_API_URL`: URL da API para o frontend

### 2. Configuração do SonarQube

#### SonarCloud (Recomendado):
1. Acesse [sonarcloud.io](https://sonarcloud.io)
2. Faça login com sua conta GitHub
3. Importe o repositório
4. Copie o token de acesso e configure os secrets

#### SonarQube Self-hosted:
1. Configure o `SONAR_HOST_URL` para sua instância
2. Gere um token de usuário
3. Configure o `SONAR_TOKEN`

## 🚀 Como Funciona

### Pipeline de CI

Executa em **todos os PRs e pushes**:

1. **Setup**: Instala Node.js 20 e dependências
2. **Database**: Provisiona PostgreSQL para testes
3. **Lint**: Executa ESLint (se disponível)
4. **Build**: Compila o projeto (se disponível)
5. **Test**: Executa testes com cobertura
6. **SonarQube**: Análise de qualidade e cobertura
7. **Quality Gate**: Verifica se passou nos critérios de qualidade

### Pipeline de CD

Executa **apenas em push para main e tags** (após Quality Gate = PASSED):

1. **Build Docker**: Cria imagens multi-plataforma
2. **Push GHCR**: Publica no GitHub Container Registry
3. **Deploy**: Executa script de deploy (se configurado)

## 📊 Cobertura de Testes

O pipeline coleta cobertura de:
- **Backend**: Jest com relatório LCOV
- **Frontend**: Vitest com relatório LCOV

Relatórios são publicados como artefatos e enviados ao SonarQube.

## 🐳 Imagens Docker

### Backend
```bash
# Imagem: ghcr.io/SEU_USUARIO/CatolicaSC-Portfolio/backend
docker pull ghcr.io/SEU_USUARIO/CatolicaSC-Portfolio/backend:latest
docker run -p 3000:3000 ghcr.io/SEU_USUARIO/CatolicaSC-Portfolio/backend:latest
```

### Frontend
```bash
# Imagem: ghcr.io/SEU_USUARIO/CatolicaSC-Portfolio/frontend
docker pull ghcr.io/SEU_USUARIO/CatolicaSC-Portfolio/frontend:latest
docker run -p 80:80 ghcr.io/SEU_USUARIO/CatolicaSC-Portfolio/frontend:latest
```

## 🚀 Deploy

### Configuração do Deploy

Edite o arquivo `deploy/production/deploy.sh` e configure sua infraestrutura:

#### Opção 1: SSH/VPS
```bash
# Configure os secrets SSH_HOST, SSH_USER, SSH_KEY
# O script fará deploy via SSH
```

#### Opção 2: Docker Swarm
```bash
# Descomente a seção Docker Swarm no script
# Configure seu cluster Swarm
```

#### Opção 3: Kubernetes
```bash
# Descomente a seção Kubernetes no script
# Configure kubectl no runner
```

#### Opção 4: Fly.io
```bash
# Descomente a seção Fly.io no script
# Configure flyctl
```

#### Opção 5: Render
```bash
# Descomente a seção Render no script
# Configure RENDER_API_KEY
```

### Deploy Manual

```bash
# 1. Build local
docker build -f backend/Dockerfile -t catolica-backend .
docker build -f frontend/Dockerfile -t catolica-frontend .

# 2. Deploy local
docker run -d --name catolica-backend -p 3000:3000 catolica-backend
docker run -d --name catolica-frontend -p 80:80 catolica-frontend
```

## 🔍 Monitoramento

### Verificar Status do Pipeline
1. Acesse a aba "Actions" no GitHub
2. Verifique os jobs "Lint, Test, Coverage & Sonar" e "Build & Push Docker"

### Verificar Quality Gate
1. Acesse o SonarQube/SonarCloud
2. Verifique o status do projeto
3. Analise os relatórios de cobertura e qualidade

### Verificar Deploy
1. Acesse o GHCR: `https://github.com/SEU_USUARIO/CatolicaSC-Portfolio/pkgs/container`
2. Verifique se as imagens foram publicadas
3. Teste o deploy em produção

## 🛠️ Desenvolvimento Local

### Executar Testes
```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

### Executar Lint
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Build Local
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 📝 Troubleshooting

### Pipeline Falha no Quality Gate
1. Verifique o relatório no SonarQube
2. Corrija os problemas de qualidade
3. Aumente a cobertura de testes se necessário

### Deploy Falha
1. Verifique se os secrets estão configurados
2. Teste o script de deploy localmente
3. Verifique a conectividade com o servidor

### Cobertura Não Aparece
1. Verifique se os testes estão gerando LCOV
2. Confirme os caminhos no `sonar-project.properties`
3. Verifique se os artefatos estão sendo baixados

## 🔗 Links Úteis

- [GitHub Actions](https://github.com/features/actions)
- [SonarCloud](https://sonarcloud.io)
- [GitHub Container Registry](https://github.com/features/packages)
- [Docker Multi-platform Builds](https://docs.docker.com/buildx/working-with-buildx/)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do GitHub Actions
2. Consulte a documentação do SonarQube
3. Abra uma issue no repositório
