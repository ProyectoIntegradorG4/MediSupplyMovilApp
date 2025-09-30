# ================================================
# Dockerfile para Desarrollo - MediSupply Movil App
# Optimizado para desarrollo con hot reload y debugging
# ================================================

FROM node:20-alpine

# Etiquetas de información
LABEL maintainer="MediSupply Team"
LABEL description="MediSupply Movil App - Development Environment"
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

# Crear directorio de trabajo
WORKDIR /app

# Instalar Expo CLI globalmente
RUN npm install -g @expo/cli@latest expo-doctor

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S expo -u 1001 -G nodejs

# Copiar archivos de configuración de paquetes
COPY package.json yarn.lock ./

# Instalar dependencias (como root para permisos)
RUN yarn install --frozen-lockfile && yarn cache clean

# Cambiar propietario de la carpeta de la aplicación y crear directorio home para expo
RUN chown -R expo:nodejs /app && \
    mkdir -p /home/expo/.expo && \
    chown -R expo:nodejs /home/expo

# Cambiar a usuario no-root
USER expo

# Copiar el código de la aplicación
COPY --chown=expo:nodejs . .

# Exponer puertos necesarios para desarrollo
# 8081: Metro bundler
# 19000: Expo DevTools  
# 19001: iOS Simulator
# 19002: Android Emulator
# 19006: Web development server
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002
EXPOSE 19006

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV EXPO_DEBUG=true
ENV EXPO_NO_TELEMETRY=1
ENV EXPO_NO_UPDATE_CHECK=1

# Health check para verificar que el servicio está funcionando
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:19006 || exit 1

# Comando por defecto para desarrollo web (más estable en Docker)
CMD ["yarn", "expo", "start", "--web", "--host", "lan"]