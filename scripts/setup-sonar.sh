#!/bin/bash

# Script para configurar o SonarQube localmente
# Uso: ./scripts/setup-sonar.sh

set -e

echo "🚀 Configurando SonarQube para o projeto CatolicaSC-Portfolio..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm estão instalados"

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm ci
echo "✅ Dependências do backend instaladas"

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm ci
echo "✅ Dependências do frontend instaladas"

# Voltar para o diretório raiz
cd ..

# Verificar se o sonar-scanner está instalado globalmente
if ! command -v sonar-scanner &> /dev/null; then
    echo "⚠️  sonar-scanner não está instalado globalmente."
    echo "   Instalando localmente nos projetos..."
    
    # Instalar sonar-scanner no backend
    cd backend
    npm install --save-dev sonar-scanner
    echo "✅ sonar-scanner instalado no backend"
    
    # Instalar sonar-scanner no frontend
    cd ../frontend
    npm install --save-dev sonar-scanner
    echo "✅ sonar-scanner instalado no frontend"
    
    cd ..
else
    echo "✅ sonar-scanner está instalado globalmente"
fi

# Verificar se o arquivo sonar-project.properties existe
if [ ! -f "sonar-project.properties" ]; then
    echo "❌ Arquivo sonar-project.properties não encontrado no diretório raiz"
    exit 1
fi

echo "✅ Arquivo sonar-project.properties encontrado"

# Verificar se o SONAR_TOKEN está configurado
if [ -z "$SONAR_TOKEN" ]; then
    echo "⚠️  Variável de ambiente SONAR_TOKEN não está configurada"
    echo "   Configure com: export SONAR_TOKEN=c8ecd4d1da050850cb10c45663b1201cc9bec071"
    echo "   Ou adicione ao seu .bashrc/.zshrc:"
    echo "   echo 'export SONAR_TOKEN=c8ecd4d1da050850cb10c45663b1201cc9bec071' >> ~/.bashrc"
else
    echo "✅ SONAR_TOKEN está configurado"
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o SONAR_TOKEN se ainda não fez:"
echo "   export SONAR_TOKEN=c8ecd4d1da050850cb10c45663b1201cc9bec071"
echo ""
echo "2. Execute os testes com cobertura:"
echo "   cd backend && npm run test:coverage"
echo "   cd frontend && npm run test:coverage"
echo ""
echo "3. Execute a análise do SonarQube:"
echo "   cd backend && npm run sonar"
echo "   cd frontend && npm run sonar"
echo ""
echo "4. Ou execute a análise completa:"
echo "   sonar-scanner"
echo ""
echo "🔗 Acesse o SonarCloud em: https://sonarcloud.io/organizations/catolicasc-portfolio"
