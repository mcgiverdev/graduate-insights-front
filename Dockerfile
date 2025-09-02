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
RUN pnpm install --no-frozen-lockfile

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

# Ejecutar nuxt prepare
RUN pnpm nuxt prepare

# Solo hacer build SPA (evitar generate que causa problemas de prerender)
RUN pnpm run generate

# ====================================
# Etapa de producción con Nginx
# ====================================
FROM nginx:alpine AS runner

# Crear directorio para archivos estáticos
RUN mkdir -p /usr/share/nginx/html

# Copiar archivos estáticos desde build SPA
COPY --from=builder /app/.output/public /usr/share/nginx/html

# Fallback: crear un index.html básico si no existe
RUN if [ ! -f "/usr/share/nginx/html/index.html" ]; then \
  echo '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sistema de Egresados</title><script type="module" crossorigin src="/_nuxt/entry.js"></script></head><body><div id="__nuxt"></div></body></html>' > /usr/share/nginx/html/index.html; \
  fi

# Crear configuración de Nginx para SPA
RUN echo 'server { \
  listen 3000; \
  server_name localhost; \
  root /usr/share/nginx/html; \
  index index.html; \
  \
  # Manejo de rutas SPA - todas las rutas van a index.html \
  location / { \
  try_files $uri $uri/ /index.html; \
  } \
  \
  # Servir archivos estáticos de _nuxt \
  location /_nuxt/ { \
  expires 1y; \
  add_header Cache-Control "public, immutable"; \
  try_files $uri =404; \
  } \
  \
  # Caching para otros assets estáticos \
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
  expires 1y; \
  add_header Cache-Control "public, immutable"; \
  } \
  \
  # Security headers \
  add_header X-Frame-Options "SAMEORIGIN" always; \
  add_header X-Content-Type-Options "nosniff" always; \
  add_header X-XSS-Protection "1; mode=block" always; \
  \
  # Gzip compression \
  gzip on; \
  gzip_vary on; \
  gzip_min_length 1024; \
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
  }' > /etc/nginx/conf.d/default.conf

# Exponer el puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
