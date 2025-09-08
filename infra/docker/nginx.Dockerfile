# Nginx Dockerfile for serving SPA + API
FROM nginx:alpine

# Copy nginx configuration
COPY infra/docker/nginx.conf /etc/nginx/nginx.conf

# Copy static files (will be mounted or copied)
COPY frontend/dist/spa /usr/share/nginx/html/frontend
COPY backend/dist /usr/share/nginx/html/api

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
