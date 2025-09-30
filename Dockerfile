############################################################
# Dockerfile de Producción - MediSupply Web (Expo + Nginx) #
############################################################

# ===== Etapa 1: Build de la app web =====
FROM node:20-alpine AS builder

WORKDIR /app
ENV CI=1

# Dependencias nativas usadas por algunas libs (sharp, etc.)
RUN apk add --no-cache bash git curl python3 make g++ libc6-compat

# Copiar e instalar dependencias
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

# Copiar el resto del código
COPY . .

# Variables públicas de build (se pueden sobreescribir con --build-arg)
ARG EXPO_PUBLIC_STAGE=prod
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_API_URL_ANDROID
ARG EXPO_PUBLIC_API_URL_IOS

# Exportar como variables de entorno para que Expo las lea en build
ENV EXPO_PUBLIC_STAGE=$EXPO_PUBLIC_STAGE \
    EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL \
    EXPO_PUBLIC_API_URL_ANDROID=$EXPO_PUBLIC_API_URL_ANDROID \
    EXPO_PUBLIC_API_URL_IOS=$EXPO_PUBLIC_API_URL_IOS \
    NODE_ENV=production

# Construir salida web estática en /app/dist
RUN yarn web:build


# ===== Etapa 2: Runtime con Nginx =====
FROM nginx:alpine AS runtime

LABEL org.opencontainers.image.title="MediSupply Web" \
      org.opencontainers.image.description="Imagen de producción para la app web de MediSupply (Expo export + Nginx)" \
      org.opencontainers.image.vendor="MediSupply" \
      org.opencontainers.image.source="https://github.com/<org>/<repo>"

# Copiar configuración de nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copiar artefactos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Healthcheck
COPY docker/health-check.sh /usr/local/bin/health-check.sh
RUN chmod +x /usr/local/bin/health-check.sh

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD /usr/local/bin/health-check.sh

CMD ["nginx", "-g", "daemon off;"]