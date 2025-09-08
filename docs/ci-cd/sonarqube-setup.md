# Configuração do SonarQube

Este documento explica como configurar o SonarQube para análise de qualidade de código no projeto CatolicaSC-Portfolio.

## Pré-requisitos

1. Conta no SonarCloud (https://sonarcloud.io/)
2. Repositório GitHub configurado
3. Token de acesso do SonarQube

## Configuração do GitHub

### 1. Criar Secret no GitHub

1. Acesse o repositório no GitHub
2. Vá para **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Configure:
   - **Name**: `SONAR_TOKEN`
   - **Value**: `c8ecd4d1da050850cb10c45663b1201cc9bec071`

### 2. Workflows do GitHub Actions

O projeto inclui os seguintes workflows:

- **`.github/workflows/build.yml`**: Build, testes e análise do SonarQube
- **`.github/workflows/sonar-quality-gate.yml`**: Verificação do Quality Gate
- **`.github/workflows/deploy.yml`**: Deploy após aprovação do Quality Gate

## Configuração do SonarQube

### 1. Arquivo de Configuração

O arquivo `sonar-project.properties` está configurado com:

```properties
sonar.projectKey=BorgesLeonardo_CatolicaSC-Portfolio
sonar.organization=catolicasc-portfolio
sonar.projectName=CatolicaSC-Portfolio
sonar.projectVersion=1.0
sonar.sources=backend/src,frontend/src
sonar.sourceEncoding=UTF-8
```

### 2. Exclusões

Os seguintes arquivos/diretórios são excluídos da análise:

- `node_modules/`
- `dist/`
- `coverage/`
- `test/`
- Arquivos de teste (`*.test.ts`, `*.spec.ts`)
- Migrações do Prisma
- Arquivos de configuração

### 3. Relatórios de Cobertura

- **Backend**: Jest gera relatório LCOV em `backend/coverage/lcov.info`
- **Frontend**: Vitest gera relatório LCOV em `frontend/coverage/lcov.info`

## Execução Local

### Backend

```bash
cd backend
npm run test:coverage
npm run sonar
```

### Frontend

```bash
cd frontend
npm run test:coverage
npm run sonar
```

## Qualidade de Código

### Thresholds Configurados

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Análise Automática

A análise é executada automaticamente:

1. **Push para main**: Build completo + SonarQube + Deploy
2. **Pull Request**: Build + SonarQube (sem deploy)
3. **Quality Gate**: Verificação de qualidade antes do deploy

## Troubleshooting

### Erro de Token

Se houver erro de autenticação:

1. Verifique se o `SONAR_TOKEN` está configurado corretamente
2. Confirme se o token tem permissões adequadas
3. Verifique se a organização `catolicasc-portfolio` existe

### Erro de Cobertura

Se os relatórios de cobertura não forem encontrados:

1. Execute os testes com cobertura: `npm run test:coverage`
2. Verifique se os arquivos `lcov.info` foram gerados
3. Confirme se os caminhos no `sonar-project.properties` estão corretos

### Erro de Build

Se o build falhar:

1. Verifique se todas as dependências estão instaladas
2. Execute `npm ci` em ambos os projetos
3. Verifique se os scripts de build estão funcionando localmente
