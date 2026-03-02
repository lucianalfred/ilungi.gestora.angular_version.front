# frontend/Dockerfile
# Estágio 1: Build da aplicação Angular
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Instalar dependências (usando legacy-peer-deps para compatibilidade)
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY src/ ./src/

# Build com configuração de produção
RUN npx ng build --configuration production --output-path=dist

# Estágio 2: Servir com Nginx
FROM nginx:alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Remover configuração padrão do Nginx
RUN rm -rf /usr/share/nginx/html/* && \
    rm -rf /etc/nginx/conf.d/default.conf

# Copiar configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar os arquivos do build (verifique o caminho correto da sua build)
COPY --from=builder /app/dist /usr/share/nginx/html

# Ajustar permissões
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/nginx.conf && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Healthcheck para o Swarm
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Expor porta
EXPOSE 80

# Usar usuário não-root
USER nginx

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]