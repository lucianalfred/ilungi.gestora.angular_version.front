# ==================================
# STAGE 1 — BUILD ANGULAR
# ==================================
FROM node:20-alpine AS builder

WORKDIR /app

# melhorar performance
ENV NG_CLI_ANALYTICS=false
ENV NODE_OPTIONS=--max-old-space-size=4096

# copiar configs primeiro (cache)
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# instalar dependências
RUN npm ci --legacy-peer-deps

# copiar resto do projeto
COPY . .

# build produção
RUN npm run build -- --configuration production


# ==================================
# STAGE 2 — RUNTIME (SEM NGINX)
# ==================================
FROM node:20-alpine

WORKDIR /app

# servidor estático leve
RUN npm install -g serve

# copiar build angular correto
COPY --from=builder /app/dist/ilungi.gestora.angular_version.front/browser ./app

WORKDIR /app/app

EXPOSE 4200

CMD ["serve", "-s", ".", "-l", "4200"]