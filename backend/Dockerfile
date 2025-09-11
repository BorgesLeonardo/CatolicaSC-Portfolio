# Dockerfile para Backend
FROM node:20-alpine AS base

# Instalar dependências necessárias para Prisma
RUN apk add --no-cache openssl

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Gerar cliente Prisma
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:20-alpine AS production

# Instalar dependências necessárias para Prisma
RUN apk add --no-cache openssl

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Configurar diretório de trabalho
WORKDIR /app

# Copiar dependências e build do estágio anterior
COPY --from=base --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=nextjs:nodejs /app/dist ./dist
COPY --from=base --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=base --chown=nextjs:nodejs /app/package*.json ./

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
