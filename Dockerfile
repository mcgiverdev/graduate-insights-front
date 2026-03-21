# Dockerfile para proyecto Nuxt.js 3 con pnpm - Solo Build SPA
FROM node:18-alpine AS base

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

# ====================================
# Etapa de dependencias
# ====================================
FROM base AS deps

WORKDIR /app

# Copiar archivos de configuración de pnpm
COPY package.json pnpm-lock.yaml ./

# Copiar los archivos necesarios para el script build:icons
COPY plugins/ ./plugins/

# Instalar todas las dependencias (incluye devDependencies necesarias para build)
RUN pnpm install --frozen-lockfile

# ====================================
# Etapa de construcción
# ====================================
FROM base AS builder

WORKDIR /app

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Configurar variables de entorno para el build
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV=production
ARG NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
ARG NUXT_APP_BASE_URL=/
ENV NUXT_PUBLIC_API_BASE_URL=${NUXT_PUBLIC_API_BASE_URL}
ENV NUXT_APP_BASE_URL=${NUXT_APP_BASE_URL}

# Variables de versión para la aplicación
ARG APP_VERSION=v1.0.3
ARG BUILD_DATE
ARG GIT_COMMIT
ENV APP_VERSION=$APP_VERSION
ENV BUILD_DATE=$BUILD_DATE
ENV GIT_COMMIT=$GIT_COMMIT

# Ejecutar nuxt prepare
RUN pnpm nuxt prepare

# Solo hacer build SPA (evitar generate que causa problemas de prerender)
RUN pnpm run generate

# ====================================
# Etapa de producción con Nginx
# ====================================
FROM nginx:alpine AS runner

# Crear directorio para archivos estáticos y herramientas necesarias
RUN apk add --no-cache curl && mkdir -p /usr/share/nginx/html

# Copiar archivos estáticos desde build SPA
COPY --from=builder /app/.output/public /usr/share/nginx/html

# Copiar configuración de Nginx para SPA
COPY infrastructure/nginx/default.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
