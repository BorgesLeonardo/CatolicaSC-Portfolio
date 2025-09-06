#!/bin/bash

# Script para validar configuração do SonarQube localmente
# Uso: ./scripts/validate-sonar.sh

set -e

echo "🔍 Validando configuração do SonarQube..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "sonar-project.properties" ]; then
    log_error "Arquivo sonar-project.properties não encontrado!"
    log_error "Execute este script a partir do diretório raiz do projeto."
    exit 1
fi

log_info "Verificando arquivos de configuração..."

# Verificar arquivos necessários
REQUIRED_FILES=(
    "sonar-project.properties"
    ".sonarcloud.properties"
    ".github/workflows/backend.yml"
    "backend/package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "Arquivo $file encontrado"
    else
        log_error "Arquivo $file não encontrado!"
        exit 1
    fi
done

# Verificar se o backend existe e tem as dependências necessárias
log_info "Verificando estrutura do backend..."

if [ ! -d "backend/src" ]; then
    log_error "Diretório backend/src não encontrado!"
    exit 1
fi

if [ ! -d "backend/src/__tests__" ]; then
    log_warning "Diretório backend/src/__tests__ não encontrado!"
    log_warning "Certifique-se de que os testes estão no local correto."
fi

# Verificar scripts no package.json
log_info "Verificando scripts do package.json..."

REQUIRED_SCRIPTS=(
    "test:ci"
    "test:coverage"
    "build"
    "lint"
)

cd backend

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if npm run-script --silent "$script" --dry-run > /dev/null 2>&1; then
        log_success "Script '$script' encontrado"
    else
        log_error "Script '$script' não encontrado no package.json!"
        exit 1
    fi
done

# Verificar se as dependências estão instaladas
log_info "Verificando dependências..."

if [ ! -d "node_modules" ]; then
    log_warning "node_modules não encontrado. Executando npm install..."
    npm install
fi

# Testar build
log_info "Testando build do projeto..."
if npm run build; then
    log_success "Build executado com sucesso"
else
    log_error "Falha no build do projeto!"
    exit 1
fi

# Testar linting
log_info "Testando linting..."
if npm run lint; then
    log_success "Linting passou sem erros"
else
    log_error "Falha no linting!"
    exit 1
fi

# Testar testes unitários
log_info "Executando testes unitários..."
if npm run test:ci; then
    log_success "Testes unitários passaram"
else
    log_error "Falha nos testes unitários!"
    exit 1
fi

# Verificar se o coverage foi gerado
if [ -f "coverage/lcov.info" ]; then
    log_success "Arquivo de coverage gerado com sucesso"
else
    log_warning "Arquivo de coverage não encontrado. Isso pode afetar a análise do SonarQube."
fi

cd ..

# Verificar variáveis de ambiente necessárias (se estiverem definidas)
log_info "Verificando variáveis de ambiente..."

if [ -n "$SONAR_TOKEN" ]; then
    log_success "SONAR_TOKEN está definido"
else
    log_warning "SONAR_TOKEN não está definido. Necessário para execução no CI/CD."
fi

if [ -n "$GITHUB_TOKEN" ]; then
    log_success "GITHUB_TOKEN está definido"
else
    log_warning "GITHUB_TOKEN não está definido. Necessário para execução no CI/CD."
fi

# Verificar configuração do sonar-project.properties
log_info "Validando sonar-project.properties..."

if grep -q "sonar.projectKey=BorgesLeonardo_CatolicaSC-Portfolio" sonar-project.properties; then
    log_success "Project Key configurado corretamente"
else
    log_error "Project Key não configurado corretamente!"
    exit 1
fi

if grep -q "sonar.organization=catolicasc-portfolio" sonar-project.properties; then
    log_success "Organization configurada corretamente"
else
    log_error "Organization não configurada corretamente!"
    exit 1
fi

if grep -q "sonar.sources=backend/src" sonar-project.properties; then
    log_success "Sources configuradas corretamente"
else
    log_error "Sources não configuradas corretamente!"
    exit 1
fi

log_success "🎉 Todas as validações passaram!"
log_info "Configuração do SonarQube está pronta para uso no CI/CD."

echo ""
log_info "📋 Próximos passos:"
echo "1. Certifique-se de que os secrets SONAR_TOKEN e GITHUB_TOKEN estão configurados no GitHub"
echo "2. Faça um push para main ou develop para testar o pipeline"
echo "3. Verifique os resultados no SonarCloud: https://sonarcloud.io/dashboard?id=BorgesLeonardo_CatolicaSC-Portfolio"
echo ""
