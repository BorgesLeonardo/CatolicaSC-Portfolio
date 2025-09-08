# CI/CD - CatolicaSC-Portfolio

Este diretório contém a documentação e configurações para o pipeline de CI/CD do projeto.

## Estrutura

```
docs/ci-cd/
├── README.md                    # Este arquivo
├── sonarqube-setup.md          # Configuração do SonarQube
└── github-secrets.md           # Configuração dos secrets do GitHub
```

## Workflows do GitHub Actions

### 1. Build e Análise (`build.yml`)

**Trigger**: Push para `main` ou Pull Request

**Jobs**:
- `build-and-test`: Build, testes e linting
- `sonarqube`: Análise de qualidade com SonarQube

**Funcionalidades**:
- Instalação de dependências
- Build do backend e frontend
- Execução de testes com cobertura
- Linting do código
- Análise de qualidade com SonarQube

### 2. Quality Gate (`sonar-quality-gate.yml`)

**Trigger**: Após conclusão do workflow de build

**Funcionalidades**:
- Verificação do Quality Gate do SonarQube
- Bloqueia deploy se qualidade não atender critérios

### 3. Deploy (`deploy.yml`)

**Trigger**: Push para `main` ou após aprovação do Quality Gate

**Funcionalidades**:
- Build de produção
- Deploy para ambiente de produção
- Configurável para diferentes ambientes

## Configuração

### Secrets Necessários

| Secret | Descrição | Valor |
|--------|-----------|-------|
| `SONAR_TOKEN` | Token de acesso do SonarQube | `c8ecd4d1da050850cb10c45663b1201cc9bec071` |

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NODE_VERSION` | Versão do Node.js | `20` |
| `SONAR_ORGANIZATION` | Organização do SonarQube | `catolicasc-portfolio` |
| `SONAR_PROJECT_KEY` | Chave do projeto no SonarQube | `BorgesLeonardo_CatolicaSC-Portfolio` |

## Qualidade de Código

### Thresholds Configurados

- **Cobertura de Código**: 80%
- **Cobertura de Branches**: 80%
- **Cobertura de Funções**: 80%
- **Cobertura de Linhas**: 80%

### Exclusões

- `node_modules/`
- `dist/`
- `coverage/`
- `test/`
- Arquivos de teste
- Migrações do Prisma

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

## Monitoramento

### SonarQube

- **URL**: https://sonarcloud.io/organizations/catolicasc-portfolio
- **Projeto**: BorgesLeonardo_CatolicaSC-Portfolio

### GitHub Actions

- **Status**: Disponível na aba "Actions" do repositório
- **Logs**: Detalhados para cada execução
- **Notificações**: Configuráveis por email ou Slack

## Troubleshooting

### Problemas Comuns

1. **Falha no Quality Gate**
   - Verificar cobertura de testes
   - Corrigir code smells
   - Resolver bugs críticos

2. **Falha no Build**
   - Verificar dependências
   - Executar testes localmente
   - Verificar configurações do TypeScript

3. **Falha no Deploy**
   - Verificar configurações de ambiente
   - Validar permissões de deploy
   - Verificar logs de deploy

### Logs e Debugging

- **GitHub Actions**: Logs disponíveis na interface do GitHub
- **SonarQube**: Logs disponíveis no SonarCloud
- **Local**: Usar `npm run` com flags de debug

## Contribuição

Para contribuir com melhorias no CI/CD:

1. Crie uma branch para sua feature
2. Faça as alterações necessárias
3. Teste localmente
4. Crie um Pull Request
5. Aguarde aprovação do Quality Gate
