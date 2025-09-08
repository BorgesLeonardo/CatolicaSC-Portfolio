# Script PowerShell para configurar o SonarQube localmente
# Uso: .\scripts\setup-sonar.ps1

Write-Host "🚀 Configurando SonarQube para o projeto CatolicaSC-Portfolio..." -ForegroundColor Green

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js está instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não está instalado. Por favor, instale o Node.js 18+ primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm está instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não está instalado. Por favor, instale o npm primeiro." -ForegroundColor Red
    exit 1
}

# Instalar dependências do backend
Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
Set-Location backend
npm ci
Write-Host "✅ Dependências do backend instaladas" -ForegroundColor Green

# Instalar dependências do frontend
Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm ci
Write-Host "✅ Dependências do frontend instaladas" -ForegroundColor Green

# Voltar para o diretório raiz
Set-Location ..

# Verificar se o sonar-scanner está instalado globalmente
try {
    $sonarVersion = sonar-scanner --version
    Write-Host "✅ sonar-scanner está instalado globalmente: $sonarVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  sonar-scanner não está instalado globalmente." -ForegroundColor Yellow
    Write-Host "   Instalando localmente nos projetos..." -ForegroundColor Yellow
    
    # Instalar sonar-scanner no backend
    Set-Location backend
    npm install --save-dev sonar-scanner
    Write-Host "✅ sonar-scanner instalado no backend" -ForegroundColor Green
    
    # Instalar sonar-scanner no frontend
    Set-Location ../frontend
    npm install --save-dev sonar-scanner
    Write-Host "✅ sonar-scanner instalado no frontend" -ForegroundColor Green
    
    Set-Location ..
}

# Verificar se o arquivo sonar-project.properties existe
if (Test-Path "sonar-project.properties") {
    Write-Host "✅ Arquivo sonar-project.properties encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo sonar-project.properties não encontrado no diretório raiz" -ForegroundColor Red
    exit 1
}

# Verificar se o SONAR_TOKEN está configurado
if ($env:SONAR_TOKEN) {
    Write-Host "✅ SONAR_TOKEN está configurado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Variável de ambiente SONAR_TOKEN não está configurada" -ForegroundColor Yellow
    Write-Host "   Configure com: `$env:SONAR_TOKEN='c8ecd4d1da050850cb10c45663b1201cc9bec071'" -ForegroundColor Cyan
    Write-Host "   Ou adicione ao seu perfil PowerShell:" -ForegroundColor Cyan
    Write-Host "   Add-Content `$PROFILE '`$env:SONAR_TOKEN=\"c8ecd4d1da050850cb10c45663b1201cc9bec071\"'" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure o SONAR_TOKEN se ainda não fez:" -ForegroundColor White
Write-Host "   `$env:SONAR_TOKEN='c8ecd4d1da050850cb10c45663b1201cc9bec071'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Execute os testes com cobertura:" -ForegroundColor White
Write-Host "   cd backend; npm run test:coverage" -ForegroundColor Gray
Write-Host "   cd frontend; npm run test:coverage" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Execute a análise do SonarQube:" -ForegroundColor White
Write-Host "   cd backend; npm run sonar" -ForegroundColor Gray
Write-Host "   cd frontend; npm run sonar" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Ou execute a análise completa:" -ForegroundColor White
Write-Host "   sonar-scanner" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Acesse o SonarCloud em: https://sonarcloud.io/organizations/catolicasc-portfolio" -ForegroundColor Blue
