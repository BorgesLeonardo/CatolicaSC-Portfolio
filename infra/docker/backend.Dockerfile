# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy source code
COPY backend/dist ./dist
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3333

# Start the application
CMD ["node", "dist/index.js"]
