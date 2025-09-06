# 📊 Configuração SonarQube CI/CD

Este documento descreve a configuração do SonarQube integrado ao pipeline de CI/CD do projeto.

## 🎯 Visão Geral

O projeto está configurado para usar o **SonarCloud** (versão cloud do SonarQube) integrado com GitHub Actions para análise contínua de qualidade de código.

## 📁 Arquivos de Configuração

### `sonar-project.properties`
Arquivo principal de configuração do SonarQube com:
- Definição do projeto e organização
- Configuração de sources e testes
- Exclusões e inclusões de arquivos
- Configurações de cobertura de código
- Configurações de branch e pull request

### `.sonarcloud.properties`
Configurações específicas do SonarCloud:
- Quality Gates personalizados
- Configurações de análise
- Timeouts e logging

### `.github/workflows/backend.yml`
Pipeline de CI/CD com integração SonarQube:
- Análise de código após testes
- Verificação de Quality Gate
- Cache para melhor performance
- Execução em PRs e branches principais

## 🔧 Configuração Inicial

### 1. SonarCloud Setup
1. Acesse [SonarCloud.io](https://sonarcloud.io)
2. Faça login com sua conta GitHub
3. Importe o projeto `BorgesLeonardo/CatolicaSC-Portfolio`
4. Configure a organização `catolicasc-portfolio`

### 2. GitHub Secrets
Configure os seguintes secrets no repositório GitHub:

```bash
# Token do SonarCloud (obtenha em: SonarCloud > My Account > Security)
SONAR_TOKEN=your_sonar_token_here

# Token do GitHub (gerado automaticamente pelo Actions)
GITHUB_TOKEN=your_github_token_here
```

### 3. Quality Gates Configurados

| Métrica | Valor Mínimo | Descrição |
|---------|--------------|-----------|
| Cobertura de Código | 80% | Percentual mínimo de código coberto por testes |
| Maintainability Rating | A | Avaliação de manutenibilidade |
| Reliability Rating | A | Avaliação de confiabilidade |
| Security Rating | A | Avaliação de segurança |
| Security Hotspots | 100% | Percentual de hotspots de segurança revisados |
| Duplicação | <3% | Percentual máximo de código duplicado |

## 🚀 Como Funciona

### Pipeline de Análise
1. **Trigger**: Push para `main`/`develop` ou Pull Request
2. **Build & Test**: Compila código e executa testes com coverage
3. **SonarQube Scan**: Analisa código e envia para SonarCloud
4. **Quality Gate**: Verifica se os critérios de qualidade foram atendidos
5. **Deploy**: Continua apenas se Quality Gate passou

### Arquivos Analisados
- ✅ `backend/src/**/*.ts` - Código fonte TypeScript
- ✅ `backend/src/__tests__/**/*.ts` - Arquivos de teste
- ❌ `node_modules/` - Dependências (excluídas)
- ❌ `dist/` - Código compilado (excluído)
- ❌ `coverage/` - Relatórios de coverage (excluídos)
- ❌ `prisma/migrations/` - Migrações do banco (excluídas)

## 🔍 Validação Local

Execute o script de validação para verificar a configuração:

### Linux/macOS:
```bash
./scripts/validate-sonar.sh
```

### Windows (PowerShell):
```powershell
# Navegue até o diretório backend
cd backend

# Execute os comandos de validação
npm install
npm run build
npm run lint
npm run test:ci

# Verifique se o arquivo de coverage foi gerado
ls coverage/lcov.info
```

## 📈 Monitoramento

### SonarCloud Dashboard
- **URL**: https://sonarcloud.io/dashboard?id=BorgesLeonardo_CatolicaSC-Portfolio
- **Métricas**: Coverage, Bugs, Vulnerabilities, Code Smells
- **Histórico**: Evolução da qualidade ao longo do tempo

### GitHub Actions
- **Logs**: Verifique os logs do workflow para detalhes da análise
- **Status**: O badge de status indica se o Quality Gate passou
- **PR Decoration**: Comentários automáticos em Pull Requests

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Quality Gate Falhando
```bash
# Verifique a cobertura de testes
npm run test:coverage

# Analise o relatório de coverage
open backend/coverage/index.html
```

#### 2. Token Inválido
```bash
# Verifique se o SONAR_TOKEN está configurado
echo $SONAR_TOKEN

# Regenere o token no SonarCloud se necessário
```

#### 3. Análise não Executando
- Verifique se o arquivo `sonar-project.properties` está no diretório raiz
- Confirme que os paths estão corretos
- Verifique os logs do GitHub Actions

### Logs Úteis
```bash
# Logs do SonarQube Scanner
tail -f ~/.sonar/cache/logs/sonar-scanner.log

# Coverage report
cat backend/coverage/lcov.info | head -20
```

## 📚 Recursos Adicionais

- [SonarCloud Documentation](https://sonarcloud.io/documentation)
- [SonarQube Quality Gates](https://docs.sonarqube.org/latest/user-guide/quality-gates/)
- [GitHub Actions Integration](https://github.com/SonarSource/sonarcloud-github-action)

## 🔄 Atualizações

### Versão 1.0 (Atual)
- ✅ Configuração inicial do SonarCloud
- ✅ Integração com GitHub Actions
- ✅ Quality Gates configurados
- ✅ Análise de cobertura de código
- ✅ Exclusões e inclusões otimizadas

### Próximas Versões
- 🔄 Análise de segurança avançada
- 🔄 Integração com ferramentas de SAST/DAST
- 🔄 Métricas personalizadas de qualidade
- 🔄 Relatórios automatizados por email
