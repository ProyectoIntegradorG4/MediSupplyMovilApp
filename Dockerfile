# ================================================
# Dockerfile para Producción - MediSupply Movil App
# Optimizado para producción con build estático
# ================================================

FROM node:20-alpine AS base

# Etiquetas de información
LABEL maintainer="MediSupply Team"
LABEL description="MediSupply Movil App - Production Build"
LABEL version="1.0.0"

# Instalar dependencias del sistema necesarias para Expo y React Native
RUN apk add --no-cache \
    git \
    bash \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Instalar Expo CLI globalmente
RUN npm install -g @expo/cli@latest

# Crear directorio de trabajo
WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S expo -u 1001 -G nodejs

# ================================================
# Stage 1: Dependencies
# ================================================
FROM base AS dependencies

# Copiar archivos de configuración de paquetes
COPY package.json yarn.lock ./

# Instalar dependencias (como root para permisos)
RUN yarn install --frozen-lockfile --production=false && yarn cache clean

# ================================================
# Stage 2: Build
# ================================================
FROM dependencies AS build

# Cambiar propietario de la carpeta de la aplicación
RUN chown -R expo:nodejs /app

# Cambiar a usuario no-root
USER expo

# Copiar el código de la aplicación
COPY --chown=expo:nodejs . .

# Build para web (producción)
RUN yarn expo export --platform web

# ================================================
# Stage 3: Production
# ================================================
FROM nginx:alpine AS production

# Instalar Node.js para posibles scripts de runtime
RUN apk add --no-cache nodejs

# Copiar configuración de nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copiar archivos buildados desde el stage anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Crear usuario no-root
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Cambiar propietario de los archivos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Crear directorio para logs
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Cambiar a usuario no-root
USER nginx

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
