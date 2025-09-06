# Use Node.js 18 LTS como base
FROM node:18-alpine AS base

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    openssl \
    ca-certificates

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Gerar cliente Prisma
RUN npx prisma generate

# Estágio de build
FROM base AS build

# Instalar todas as dependências (incluindo dev)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação (se necessário)
RUN npm run build || echo "No build script found"

# Estágio de produção
FROM base AS production

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar aplicação
COPY --from=build --chown=nodejs:nodejs /app .

# Criar diretório para uploads
RUN mkdir -p uploads && chown nodejs:nodejs uploads

# Expor porta
EXPOSE 3000

# Configurar usuário
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
