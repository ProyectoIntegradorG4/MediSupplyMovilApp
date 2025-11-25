
# 📱 MediSupply - Aplicación Móvil

> Aplicación móvil multiplataforma desarrollada con **React Native** y **Expo** para la gestión de suministros médicos.

[![React Native](https://img.shields.io/badge/React%20Native-0.79.x-blue.svg)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-53-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

---

## � Tabla de Contenidos

1. [Descripción del Proyecto](#-descripción-del-proyecto)
2. [Creación del Proyecto](#-creación-del-proyecto)
3. [Requisitos del Sistema](#-requisitos-del-sistema)
4. [Instalación y Configuración](#-instalación-y-configuración)
5. [Desarrollo Local](#-desarrollo-local)
6. [Desarrollo con Docker](#-desarrollo-con-docker)
7. [Variables de Entorno](#-variables-de-entorno)
8. [Estructura del Proyecto](#-estructura-del-proyecto)
9. [Scripts Disponibles](#-scripts-disponibles)
10. [Troubleshooting](#-troubleshooting)
11. [Despliegue](#-despliegue)
12. [Contribución](#-contribución)

---

## 🎯 Descripción del Proyecto

**MediSupply** es una aplicación móvil multiplataforma que permite la gestión eficiente de suministros médicos, desarrollada para mejorar la logística y el control de inventarios en el sector salud.

### **Características principales:**
- ✅ **Multiplataforma**: iOS, Android y Web
- ✅ **Autenticación**: Sistema de login y registro
- ✅ **Gestión de productos**: CRUD completo
- ✅ **Interfaz responsive**: Diseño adaptable
- ✅ **Desarrollo optimizado**: Hot reload y debugging

### **Stack tecnológico:**
- **Frontend**: React Native + Expo
- **Lenguaje**: TypeScript
- **Navegación**: Expo Router
- **Containerización**: Docker
- **Control de versiones**: Git

---

## 🚀 Creación del Proyecto

### **Paso 1: Comando inicial**
```bash
yarn create expo-app medisupply-movil-app --template tabs
```

### **Paso 2: Configuración inicial**
```bash
cd medisupply-movil-app
yarn install
npx expo install --fix
```

### **Paso 3: Estructura base establecida**
- Configuración de TypeScript
- Implementación de navegación por tabs
- Setup de componentes base
- Configuración de Docker para desarrollo

---

## 🔧 Requisitos del Sistema

### **Desarrollo Local:**
| Herramienta | Versión mínima | Recomendada |
|-------------|----------------|-------------|
| Node.js     | 18.x          | 20.x        |
| Yarn        | 1.22.x        | 4.x         |
| Expo CLI    | 6.x           | Latest      |

### **Desarrollo con Docker:**
| Herramienta | Versión mínima |
|-------------|----------------|
| Docker      | 20.x          |
| Docker Compose | 2.x        |

### **Dispositivos de prueba:**
- **Android**: API 21+ (Android 5.0+)
- **iOS**: iOS 13.0+
- **Web**: Navegadores modernos

---

## 📦 Instalación y Configuración

### **Opción 1: Configuración desde cero**

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ProyectoIntegradorG4/MediSupplyMovilApp.git
   cd medisupply-movil-app
   ```

2. **Instalar dependencias:**
   ```bash
   yarn install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tu configuración local
   ```

4. **Verificar compatibilidad:**
   ```bash
   npx expo install --fix
   npx expo doctor
   ```

---

## 💻 Desarrollo Local

### **🚀 Inicio rápido**

```bash
# Iniciar servidor de desarrollo
yarn start

# Limpiar cache si hay problemas
yarn start --clear
```

### **📱 Plataformas específicas**

```bash
# Android (requiere Android Studio/emulador)
yarn android

# iOS (requiere macOS + Xcode)
yarn ios

# Web (navegador)
yarn web
```

### **🔥 Características del desarrollo local**

- **Hot Reload**: Cambios instantáneos al guardar
- **Live Reload**: Recarga automática en cambios de estructura
- **Debug**: Herramientas de desarrollo integradas
- **Expo DevTools**: Interface web de control

### **📋 URLs de acceso local**

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Metro Bundler | http://localhost:8081 | Servidor de desarrollo |
| Expo DevTools | http://localhost:19000 | Panel de control |
| Web App | http://localhost:19006 | Aplicación web |

---

## � Desarrollo con Docker

### **🎯 Ventajas del desarrollo dockerizado**

- ✅ **Entorno consistente** entre desarrolladores
- ✅ **Aislamiento** de dependencias del sistema
- ✅ **Reproducibilidad** garantizada
- ✅ **Fácil setup** sin instalaciones locales

### **⚡ Inicio rápido con Docker**

```bash
# Iniciar aplicación
docker-compose up app

# Iniciar con API mock
docker-compose --profile api up

# Rebuild si cambias dependencias
docker-compose up --build
```

### **🔧 Comandos Docker detallados**

```bash
# === COMANDOS BÁSICOS ===

# Iniciar en foreground (ver logs)
docker-compose up app

# Iniciar en background
docker-compose up -d app

# Ver logs en tiempo real
docker-compose logs -f app

# === CON API MOCK ===

# Iniciar app + API simulada
docker-compose --profile api up

# En background
docker-compose --profile api up -d

# === MANTENIMIENTO ===

# Rebuild por cambios en Dockerfile/dependencias
docker-compose up --build

# Parar servicios
docker-compose down

# Limpiar completamente (containers, volumes, networks)
docker-compose down -v --remove-orphans

# === DEBUGGING ===

# Acceder al container
docker-compose exec app sh

# Ver configuración actual
docker-compose config
```

### **🌐 URLs de acceso dockerizado**

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Web App | http://localhost:19006 | Aplicación web |
| Expo DevTools | http://localhost:19000 | Panel de control |
| Metro Bundler | http://localhost:8081 | Servidor de desarrollo |
| API Mock | http://localhost:3000 | API simulada (opcional) |

### **📱 Acceso desde dispositivos móviles**

Para conectar desde tu teléfono/tablet:

1. **Asegúrate de estar en la misma red WiFi**
2. **Usa tu IP local**: `http://TU_IP:19006`
3. **Ejemplo**: `http://192.168.1.100:19006`

```bash
# Encontrar tu IP (Windows)
ipconfig

# Encontrar tu IP (macOS/Linux)
ifconfig
```

---

## 🔐 Variables de Entorno

### **📁 Configuración centralizada**

Cambio de entorno con una sola variable:

```bash
# .env (ejemplo)
EXPO_PUBLIC_STAGE=dev
# Cambia SOLO esta variable para alternar
EXPO_PUBLIC_ENV=aws # o local

# AWS (ALB - sin puerto explícito)
EXPO_PUBLIC_GATEWAY_URL=http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com

# Local (NGINX/gateway en puerto 80)
EXPO_PUBLIC_LOCAL_GATEWAY_URL=http://192.168.10.5:80
```

### **🎯 Configuración por entorno**

| Variable | Desarrollo | Producción |
|----------|------------|------------|
| `EXPO_PUBLIC_STAGE` | `dev` | `prod` |
| `EXPO_PUBLIC_ENV` | `local` o `aws` | `aws` |
| `EXPO_PUBLIC_LOCAL_GATEWAY_URL` | IP local con puerto 80 | n/a |
| `EXPO_PUBLIC_GATEWAY_URL` | ALB opcional | ALB/dominio público |

### **📋 Cambiar configuración**

1. **Editar archivo `.env`**
2. **Reiniciar servidor de desarrollo**
3. **Para Docker**: `docker-compose down && docker-compose up`

---

## 📁 Estructura del Proyecto

```
medisupply-movil-app/
├── 📱 app/                          # Páginas y navegación (Expo Router)
│   ├── (products-app)/              # Grupo de rutas de productos
│   ├── auth/                        # Autenticación (login/registro)
│   └── _layout.tsx                  # Layout principal
├── 🎨 presentation/                 # Componentes UI y tema
│   ├── theme/                       # Sistema de diseño
│   └── auth/                        # Componentes de autenticación
├── 🔧 core/                         # Lógica de negocio
│   └── auth/                        # Servicios de autenticación
├── 🔗 constants/                    # Configuración y constantes
│   ├── config.ts                    # Configuración centralizada
│   └── Colors.ts                    # Paleta de colores
├── 🛠️ helpers/                      # Utilidades y adaptadores
├── 🐳 docker/                       # Configuración Docker
├── 📋 docker-compose.yml            # Orquestación de contenedores
├── 🔧 Dockerfile.dev                # Imagen de desarrollo
├── ⚙️ .env                          # Variables de entorno
└── 📚 docs/                         # Documentación adicional
```

---

## � Scripts Disponibles

### **🚀 Desarrollo**

| Comando | Descripción | Cuándo usar |
|---------|-------------|-------------|
| `yarn start` | Inicia servidor de desarrollo | Desarrollo diario |
| `yarn start --clear` | Inicia limpiando cache | Problemas de cache |
| `yarn web` | Ejecuta en navegador | Pruebas rápidas UI |
| `yarn android` | Ejecuta en Android | Testing en emulador/dispositivo |
| `yarn ios` | Ejecuta en iOS | Testing en simulator (macOS) |

### **🔧 Mantenimiento**

| Comando | Descripción | Cuándo usar |
|---------|-------------|-------------|
| `npx expo install --fix` | Corrige dependencias | Problemas de versiones |
| `npx expo doctor` | Diagnóstico del proyecto | Verificar configuración |
| `yarn install` | Instala dependencias | Después de `git pull` |
| `yarn cache clean` | Limpia cache de Yarn | Problemas de dependencias |

### **🐳 Docker**

| Comando | Descripción | Cuándo usar |
|---------|-------------|-------------|
| `docker-compose up app` | Inicia app dockerizada | Desarrollo con Docker |
| `docker-compose --profile api up` | + API mock | Testing con API simulada |
| `docker-compose up --build` | Rebuild y inicia | Cambios en Dockerfile |

---

## 🚨 Troubleshooting

### **❌ Problemas comunes y soluciones**

<details>
<summary><strong>Error: "Expo SDK version mismatch"</strong></summary>

```bash
# Solución
npx expo install --fix
yarn install
```
</details>

<details>
<summary><strong>Error: "Metro bundler not starting"</strong></summary>

```bash
# Solución
yarn start --clear
# o
npx expo start --clear
```
</details>

<details>
<summary><strong>Error: "Cannot connect from mobile device"</strong></summary>

```bash
# 1. Verificar IP local
ipconfig  # Windows
ifconfig  # macOS/Linux

# 2. Actualizar .env
LOCAL_IP=TU_IP_REAL

# 3. Reiniciar servidor
yarn start
```
</details>

<details>
<summary><strong>Error: "Docker port already in use"</strong></summary>

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :19006

# Parar Docker anterior
docker-compose down

# O cambiar puerto en docker-compose.yml
```
</details>

<details>
<summary><strong>Error: "Dependencies version conflicts"</strong></summary>

```bash
# Limpiar y reinstalar
rm -rf node_modules
rm yarn.lock
yarn install
npx expo install --fix
```
</details>

### **🔍 Comandos de diagnóstico**

```bash
# Verificar configuración Expo
npx expo doctor

# Verificar configuración Docker
docker-compose config

# Verificar versiones
node --version
yarn --version
npx expo --version
```

---

## 🚀 Despliegue

### **📱 Build para Testing - Generar APK**

> **📖 Manual Completo:** Consulta el [Manual de Build APK](./MANUAL_BUILD_APK.md) para una guía detallada paso a paso.

**Métodos disponibles:**

1. **EAS Build (Recomendado)** - Build en la nube, sin necesidad de Android Studio
   ```bash
   # Verificar configuración primero
   yarn build:apk:check
   
   # Build con EAS
   yarn build:apk:eas
   ```

2. **Build Local** - Requiere Android Studio configurado
   ```bash
   # Build local
   yarn build:apk:local
   ```

3. **Script de Ayuda Interactivo**
   ```bash
   # Linux/macOS
   bash ./scripts/build-apk.sh
   
   # Windows PowerShell
   .\scripts\build-apk.ps1
   ```

### **📱 Build para tiendas de aplicaciones**

```bash
# Configurar EAS (una sola vez)
npm install -g eas-cli
eas login
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios

# Build para ambas plataformas
eas build --platform all
```

### **🌐 Deploy web**

```bash
# Build para web
npx expo export:web

# Deploy con Netlify/Vercel
npm run build
```

---

## 🤝 Contribución

### **📋 Proceso de desarrollo**

1. **Fork del repositorio**
2. **Crear rama feature**: `git checkout -b feature/nueva-funcionalidad`
3. **Desarrollar y probar** (local o Docker)
4. **Commit con formato**: `git commit -m "feat: nueva funcionalidad"`
5. **Push y Pull Request**

### **📝 Estándares de código**

- **TypeScript**: Tipado estricto
- **ESLint**: Linting automático
- **Prettier**: Formateo consistente
- **Conventional Commits**: Mensajes estructurados

### **🧪 Testing**

```bash
# Ejecutar tests
yarn test

# Tests en watch mode
yarn test --watch

# Coverage
yarn test --coverage
```

---

## 📚 Recursos Adicionales

### **📖 Documentación oficial**

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://expo.github.io/router/)

### **🛠️ Herramientas de desarrollo**

- [Expo DevTools](https://docs.expo.dev/debugging/tools/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)

### **📱 Testing en dispositivos**

- [Expo Go](https://expo.dev/client) - App para testing
- [Android Studio](https://developer.android.com/studio) - Emulador Android
- [Xcode](https://developer.apple.com/xcode/) - Simulator iOS

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👥 Equipo

Desarrollado por **Proyecto Integrador G4** - Universidad MISO

---

<div align="center">
  <p><strong>🚀 ¡Listo para desarrollar! 🚀</strong></p>
  <p><em>Para soporte técnico, crear un issue en el repositorio</em></p>
</div>
