#!/bin/bash

# Script para configurar SonarQube localmente
# Uso: ./setup-sonar.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[SONAR]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    error "Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

log "Iniciando configuração do SonarQube..."

# Navegar para o diretório do script
cd "$(dirname "$0")/.."

# Parar containers existentes se estiverem rodando
log "Parando containers existentes..."
docker-compose -f docker-compose.sonar.yml down 2>/dev/null || true

# Iniciar SonarQube
log "Iniciando SonarQube..."
docker-compose -f docker-compose.sonar.yml up -d

# Aguardar o SonarQube inicializar
log "Aguardando SonarQube inicializar (isso pode levar alguns minutos)..."
timeout=300
counter=0

while [ $counter -lt $timeout ]; do
    if curl -s http://localhost:9000/api/system/status | grep -q "UP"; then
        log "SonarQube está rodando!"
        break
    fi
    
    if [ $counter -eq 0 ]; then
        info "Aguardando SonarQube inicializar..."
    fi
    
    sleep 10
    counter=$((counter + 10))
    
    if [ $counter -ge $timeout ]; then
        error "Timeout aguardando SonarQube inicializar"
        exit 1
    fi
done

# Aguardar mais um pouco para garantir que está totalmente pronto
sleep 30

# Verificar se o SonarQube está acessível
if curl -s http://localhost:9000/api/system/status | grep -q "UP"; then
    log "✅ SonarQube configurado com sucesso!"
    info "Acesse: http://localhost:9000"
    info "Usuário padrão: admin"
    info "Senha padrão: admin"
    info ""
    info "Para configurar o projeto:"
    info "1. Acesse http://localhost:9000"
    info "2. Faça login com admin/admin"
    info "3. Crie um novo projeto"
    info "4. Gere um token de acesso"
    info "5. Configure as variáveis de ambiente:"
    info "   SONAR_TOKEN=<seu-token>"
    info "   SONAR_HOST_URL=http://localhost:9000"
else
    error "Falha ao configurar SonarQube"
    exit 1
fi

log "Configuração concluída!"
