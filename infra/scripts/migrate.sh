#!/bin/bash

# Script para executar migrações do banco de dados
# Uso: ./migrate.sh [up|down|reset]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[MIGRATE]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Verificar se o comando foi fornecido
if [ $# -eq 0 ]; then
    error "Uso: $0 [up|down|reset|status]"
    exit 1
fi

COMMAND=$1

# Navegar para o diretório do backend
cd "$(dirname "$0")/../../backend"

# Verificar se o .env existe
if [ ! -f ".env" ]; then
    error "Arquivo .env não encontrado. Copie o env.example e configure as variáveis."
    exit 1
fi

case $COMMAND in
    "up")
        log "Executando migrações..."
        npx prisma migrate deploy
        log "Migrações executadas com sucesso!"
        ;;
    "down")
        warn "Revertendo última migração..."
        npx prisma migrate resolve --rolled-back $(npx prisma migrate status | grep "not yet applied" | head -1 | awk '{print $1}')
        log "Migração revertida!"
        ;;
    "reset")
        warn "Resetando banco de dados..."
        npx prisma migrate reset --force
        log "Banco resetado!"
        ;;
    "status")
        log "Status das migrações:"
        npx prisma migrate status
        ;;
    *)
        error "Comando inválido: $COMMAND"
        error "Uso: $0 [up|down|reset|status]"
        exit 1
        ;;
esac
