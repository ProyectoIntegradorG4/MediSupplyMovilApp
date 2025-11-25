# 📱 Manual Completo: Generación de APK para Testing - MediSupply App

> **Guía paso a paso detallada para generar una APK funcional de la aplicación MediSupply para el equipo de testing**

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#-requisitos-previos)
2. [Preparación del Entorno](#-preparación-del-entorno)
3. [Método 1: EAS Build (Recomendado)](#-método-1-eas-build-recomendado)
4. [Método 2: Build Local con Expo](#-método-2-build-local-con-expo)
5. [Configuración de Variables de Entorno para Testing](#-configuración-de-variables-de-entorno-para-testing)
6. [Distribución de la APK](#-distribución-de-la-apk)
7. [Troubleshooting](#-troubleshooting)
8. [Checklist Pre-Build](#-checklist-pre-build)

---

## 🔧 Requisitos Previos

### **Software Necesario:**

| Herramienta | Versión Mínima | Versión Recomendada | Descripción |
|-------------|----------------|---------------------|-------------|
| **Node.js** | 18.x | 20.x LTS | Runtime de JavaScript |
| **Yarn** | 1.22.x | 4.x | Gestor de paquetes |
| **Expo CLI** | 6.x | Latest | CLI de Expo |
| **EAS CLI** | 3.x | Latest | CLI para builds en la nube |
| **Git** | 2.x | Latest | Control de versiones |

### **Cuentas Necesarias:**

- ✅ **Cuenta de Expo** (gratuita): [https://expo.dev/signup](https://expo.dev/signup)
- ✅ **Cuenta de EAS** (incluida con Expo)

### **Verificar Instalaciones:**

```bash
# Verificar Node.js
node --version
# Debe mostrar: v18.x.x o superior

# Verificar Yarn
yarn --version
# Debe mostrar: 1.22.x o superior

# Verificar Expo CLI
npx expo --version
# Debe mostrar: 6.x.x o superior

# Verificar EAS CLI (si ya está instalado)
eas --version
# Si no está instalado, se instalará en el siguiente paso
```

---

## 🚀 Preparación del Entorno

### **Paso 1: Clonar y Navegar al Proyecto**

```bash
# Si aún no tienes el proyecto clonado
git clone <URL_DEL_REPOSITORIO>
cd MediSupplyMovilApp

# O si ya lo tienes, asegúrate de estar en la raíz del proyecto
cd MediSupplyMovilApp
```

### **Paso 2: Instalar Dependencias**

```bash
# Instalar todas las dependencias del proyecto
yarn install

# Verificar que no haya problemas de compatibilidad
npx expo install --fix

# Verificar la configuración del proyecto
npx expo doctor
```

**⚠️ Importante:** Si `expo doctor` muestra errores, corrígelos antes de continuar.

### **Paso 3: Verificar Archivos de Configuración**

Asegúrate de que estos archivos existan y estén correctamente configurados:

- ✅ `package.json` - Dependencias y scripts
- ✅ `app.json` - Configuración de Expo
- ✅ `tsconfig.json` - Configuración de TypeScript
- ✅ `.env` o `env.example` - Variables de entorno

### **Paso 4: Configurar Variables de Entorno**

```bash
# Si no existe el archivo .env, copiarlo desde el ejemplo
cp env.example .env

# Editar el archivo .env con tus configuraciones de testing
# Ver sección "Configuración de Variables de Entorno para Testing"
```

---

## ☁️ Método 1: EAS Build (Recomendado)

> **Ventajas:** Build en la nube, no requiere Android Studio, más rápido, mejor para CI/CD

### **Paso 1: Instalar EAS CLI**

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# O con yarn
yarn global add eas-cli

# Verificar instalación
eas --version
```

### **Paso 2: Iniciar Sesión en Expo**

```bash
# Iniciar sesión con tu cuenta de Expo
eas login

# Si no tienes cuenta, crear una en: https://expo.dev/signup
# Luego ejecutar: eas login
```

### **Paso 3: Configurar EAS Build**

```bash
# Configurar EAS Build (creará el archivo eas.json)
eas build:configure

# Esto te preguntará:
# - ¿Qué plataformas quieres configurar? → Selecciona "Android"
# - ¿Quieres usar EAS Build? → Sí
```

### **Paso 4: Crear Archivo de Configuración EAS**

Si el comando anterior no creó el archivo `eas.json`, créalo manualmente:

```bash
# Crear archivo eas.json en la raíz del proyecto
```

**Contenido del archivo `eas.json`:**

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_STAGE": "dev"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_STAGE": "prod"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### **Paso 5: Configurar app.json para Build**

Verifica que `app.json` tenga la configuración correcta de Android:

```json
{
  "expo": {
    "android": {
      "package": "com.medisupply.movilapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES",
        "READ_MEDIA_VIDEO"
      ],
      "usesCleartextTraffic": true
    }
  }
}
```

**⚠️ Importante:** Si no existe el campo `package` en `android`, agrégalo. Este será el identificador único de tu app.

### **Paso 6: Actualizar Version Code**

Antes de cada build, actualiza el `versionCode` en `app.json`:

```json
{
  "expo": {
    "android": {
      "versionCode": 2  // Incrementar en cada build
    }
  }
}
```

### **Paso 7: Configurar Variables de Entorno para el Build**

Crea un archivo `.env.preview` o configura las variables en `eas.json`:

**Opción A: Variables en eas.json (Recomendado para testing)**

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_STAGE": "dev",
        "EXPO_PUBLIC_GATEWAY_URL": "http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com",
        "EXPO_PUBLIC_GATEWAY_URL_ANDROID": "http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com",
        "EXPO_PUBLIC_GATEWAY_URL_IOS": "http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com"
      }
    }
  }
}
```

**Opción B: Archivo .env.preview**

```bash
# Crear archivo .env.preview
EXPO_PUBLIC_STAGE=dev
EXPO_PUBLIC_GATEWAY_URL=http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com
EXPO_PUBLIC_GATEWAY_URL_ANDROID=http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com
EXPO_PUBLIC_GATEWAY_URL_IOS=http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com
```

### **Paso 8: Iniciar el Build**

```bash
# Build para Android (APK) - Perfil preview (testing)
eas build --platform android --profile preview

# El proceso te preguntará:
# - ¿Quieres crear una nueva keystore? → Sí (para la primera vez)
# - ¿Quieres guardar la contraseña del keystore? → Opcional (recomendado guardarla en un lugar seguro)
```

**⏱️ Tiempo estimado:** 15-30 minutos (depende de la carga del servidor)

### **Paso 9: Monitorear el Build**

El comando mostrará una URL para monitorear el progreso:

```
Build started, it may take a few minutes to complete.
You can monitor the build at: https://expo.dev/accounts/[tu-usuario]/builds/[build-id]
```

También puedes verificar el estado con:

```bash
# Ver estado de builds recientes
eas build:list

# Ver detalles de un build específico
eas build:view [BUILD_ID]
```

### **Paso 10: Descargar la APK**

Una vez completado el build:

1. **Opción A: Desde la terminal**
   ```bash
   # El comando te dará un enlace directo para descargar
   # O puedes usar:
   eas build:download [BUILD_ID]
   ```

2. **Opción B: Desde el dashboard**
   - Ve a: https://expo.dev/accounts/[tu-usuario]/builds
   - Busca tu build completado
   - Haz clic en "Download" para descargar la APK

### **Paso 11: Verificar la APK**

```bash
# Verificar que el archivo se descargó correctamente
ls -lh *.apk

# Deberías ver algo como:
# medisupply-movil-app-1.0.0-1234567890.apk
```

---

## 🏠 Método 2: Build Local con Expo

> **Ventajas:** Control total, no requiere cuenta de Expo, funciona offline  
> **Desventajas:** Requiere Android Studio y más configuración

### **Paso 1: Instalar Android Studio**

1. Descargar Android Studio: [https://developer.android.com/studio](https://developer.android.com/studio)
2. Instalar con las siguientes opciones:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device (AVD)
   - ✅ Performance (Intel HAXM o Hypervisor)

### **Paso 2: Configurar Variables de Entorno de Android**

**Windows (PowerShell):**

```powershell
# Agregar a las variables de entorno del sistema:
# ANDROID_HOME = C:\Users\[TU_USUARIO]\AppData\Local\Android\Sdk
# O agregar al PATH:
# C:\Users\[TU_USUARIO]\AppData\Local\Android\Sdk\platform-tools
# C:\Users\[TU_USUARIO]\AppData\Local\Android\Sdk\tools

# Verificar instalación
adb version
```

**macOS/Linux:**

```bash
# Agregar al ~/.bashrc o ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Recargar configuración
source ~/.bashrc  # o source ~/.zshrc

# Verificar instalación
adb version
```

### **Paso 3: Prebuild (Generar Código Nativo)**

```bash
# Generar las carpetas android/ e ios/ con código nativo
npx expo prebuild --platform android

# Esto creará la carpeta android/ con el proyecto Android nativo
```

**⚠️ Importante:** La carpeta `android/` se genera automáticamente y NO debe subirse a Git (ya está en `.gitignore`).

### **Paso 4: Configurar Variables de Entorno**

Asegúrate de tener un archivo `.env` con las variables necesarias:

```bash
# .env
EXPO_PUBLIC_STAGE=dev
EXPO_PUBLIC_GATEWAY_URL=http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com
EXPO_PUBLIC_GATEWAY_URL_ANDROID=http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com
EXPO_PUBLIC_GATEWAY_URL_IOS=http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com
```

### **Paso 5: Generar Keystore (Firma de la APK)**

```bash
# Navegar a la carpeta android
cd android/app

# Generar keystore (solo la primera vez)
keytool -genkeypair -v -storetype PKCS12 -keystore medisupply-release-key.keystore -alias medisupply-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Te pedirá:
# - Contraseña del keystore (guárdala en un lugar seguro)
# - Información de identidad (nombre, organización, etc.)

# Volver a la raíz del proyecto
cd ../..
```

**⚠️ IMPORTANTE:** Guarda el archivo `.keystore` y la contraseña en un lugar seguro. Sin ellos NO podrás actualizar la app en el futuro.

### **Paso 6: Configurar Gradle para Usar el Keystore**

Crear o editar `android/gradle.properties`:

```properties
# android/gradle.properties
MEDISUPPLY_RELEASE_STORE_FILE=medisupply-release-key.keystore
MEDISUPPLY_RELEASE_KEY_ALIAS=medisupply-key-alias
MEDISUPPLY_RELEASE_STORE_PASSWORD=tu_contraseña_aquí
MEDISUPPLY_RELEASE_KEY_PASSWORD=tu_contraseña_aquí
```

**⚠️ Seguridad:** Este archivo contiene contraseñas. Asegúrate de que esté en `.gitignore`.

### **Paso 7: Configurar build.gradle**

Editar `android/app/build.gradle` y agregar la configuración de signing:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MEDISUPPLY_RELEASE_STORE_FILE')) {
                storeFile file(MEDISUPPLY_RELEASE_STORE_FILE)
                storePassword MEDISUPPLY_RELEASE_STORE_PASSWORD
                keyAlias MEDISUPPLY_RELEASE_KEY_ALIAS
                keyPassword MEDISUPPLY_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

### **Paso 8: Compilar la APK**

```bash
# Desde la raíz del proyecto
cd android

# Compilar APK de release
./gradlew assembleRelease

# En Windows:
gradlew.bat assembleRelease

# La APK se generará en:
# android/app/build/outputs/apk/release/app-release.apk
```

### **Paso 9: Verificar la APK Generada**

```bash
# Verificar que la APK existe
ls -lh android/app/build/outputs/apk/release/app-release.apk

# Ver información de la APK
aapt dump badging android/app/build/outputs/apk/release/app-release.apk
```

### **Paso 10: Instalar en Dispositivo**

```bash
# Conectar dispositivo Android vía USB y habilitar "Depuración USB"
# Luego instalar:
adb install android/app/build/outputs/apk/release/app-release.apk

# O copiar manualmente la APK al dispositivo e instalarla
```

---

## 🔐 Configuración de Variables de Entorno para Testing

### **Variables Requeridas para Testing**

Crea un archivo `.env` o `.env.preview` con las siguientes variables:

```bash
# ================================================
# Variables de Entorno para Testing
# ================================================

# Entorno
EXPO_PUBLIC_STAGE=dev
EXPO_DEBUG=true

# API Gateway (AWS ALB)
EXPO_PUBLIC_GATEWAY_URL=http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com
EXPO_PUBLIC_GATEWAY_URL_ANDROID=http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com
EXPO_PUBLIC_GATEWAY_URL_IOS=http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com

# Configuración de red (si usas servidor local)
LOCAL_IP=192.168.5.107
GATEWAY_PORT=80
```

### **Para Builds con EAS**

Las variables deben estar en `eas.json`:

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_STAGE": "dev",
        "EXPO_PUBLIC_GATEWAY_URL": "http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com",
        "EXPO_PUBLIC_GATEWAY_URL_ANDROID": "http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com",
        "EXPO_PUBLIC_GATEWAY_URL_IOS": "http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com"
      }
    }
  }
}
```

### **Verificar Variables en Build**

Para asegurarte de que las variables se están usando correctamente, puedes agregar logs temporales en `constants/config.ts`:

```typescript
// Al inicio del archivo, después de las importaciones
console.log('🔍 Variables de entorno en build:');
console.log('EXPO_PUBLIC_STAGE:', process.env.EXPO_PUBLIC_STAGE);
console.log('EXPO_PUBLIC_GATEWAY_URL:', process.env.EXPO_PUBLIC_GATEWAY_URL);
```

---

## 📦 Distribución de la APK

### **Opción 1: Distribución Directa**

1. **Compartir archivo directamente:**
   - Subir la APK a Google Drive, Dropbox, o similar
   - Compartir el enlace con el equipo de testing
   - Los testers descargan e instalan manualmente

2. **Instalación en dispositivos:**
   ```bash
   # Enviar por email/chat y que instalen manualmente
   # O usar adb para instalar directamente:
   adb install -r medisupply-movil-app.apk
   ```

### **Opción 2: Usar EAS Update (Recomendado para Actualizaciones)**

```bash
# Configurar EAS Update
eas update:configure

# Publicar actualización OTA (Over-The-Air)
eas update --branch preview --message "Build para testing v1.0.0"

# Los usuarios con la app instalada recibirán la actualización automáticamente
```

### **Opción 3: Firebase App Distribution**

1. Configurar Firebase App Distribution
2. Subir la APK a Firebase
3. Invitar testers por email
4. Los testers reciben un enlace para descargar e instalar

### **Instrucciones para Testers**

Crea un documento con estas instrucciones:

```
📱 Instrucciones de Instalación - MediSupply App

1. Descargar la APK desde el enlace proporcionado
2. En tu dispositivo Android, ir a Configuración > Seguridad
3. Habilitar "Instalar aplicaciones de fuentes desconocidas"
4. Abrir el archivo APK descargado
5. Seguir las instrucciones de instalación
6. Abrir la app y verificar que funcione correctamente

⚠️ Nota: Si tienes una versión anterior instalada, desinstálala primero.
```

---

## 🚨 Troubleshooting

### **Error: "EAS Build failed"**

**Causa común:** Variables de entorno no configuradas correctamente

**Solución:**
```bash
# Verificar configuración de eas.json
cat eas.json

# Verificar que las variables estén en el perfil correcto
# Reintentar el build
eas build --platform android --profile preview --clear-cache
```

### **Error: "Keystore not found" (Build Local)**

**Solución:**
```bash
# Verificar que el keystore existe
ls -la android/app/*.keystore

# Verificar ruta en gradle.properties
cat android/gradle.properties

# Regenerar keystore si es necesario
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore medisupply-release-key.keystore -alias medisupply-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### **Error: "Gradle build failed"**

**Solución:**
```bash
# Limpiar build anterior
cd android
./gradlew clean

# Verificar versión de Java (debe ser Java 17)
java -version

# Reintentar build
./gradlew assembleRelease
```

### **Error: "APK no se instala en dispositivo"**

**Causas y soluciones:**

1. **APK no firmada correctamente:**
   ```bash
   # Verificar firma de la APK
   jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
   ```

2. **Versión anterior instalada:**
   ```bash
   # Desinstalar versión anterior
   adb uninstall com.medisupply.movilapp
   
   # O desde el dispositivo: Configuración > Apps > MediSupply > Desinstalar
   ```

3. **Permisos de instalación:**
   - Habilitar "Instalar aplicaciones de fuentes desconocidas" en el dispositivo

### **Error: "Variables de entorno no se aplican"**

**Solución:**
```bash
# Verificar que las variables estén en eas.json (para EAS Build)
cat eas.json

# O en .env (para build local)
cat .env

# Limpiar cache y rebuild
npx expo start --clear
eas build --platform android --profile preview --clear-cache
```

### **Error: "Build tarda mucho tiempo"**

**Solución:**
- EAS Build: Normal que tarde 15-30 minutos en la primera vez
- Build Local: Puede tardar 10-20 minutos la primera vez, luego es más rápido

### **APK muy grande**

**Optimización:**
```bash
# Generar APK dividida (split APKs) para reducir tamaño
cd android
./gradlew bundleRelease

# Esto genera un AAB (Android App Bundle) que Google Play optimiza automáticamente
# Para testing, puedes generar APKs específicas por arquitectura:
./gradlew assembleRelease -PtargetArchitectures=arm64-v8a,armeabi-v7a
```

---

## ✅ Checklist Pre-Build

Antes de generar la APK, verifica:

### **Configuración del Proyecto**
- [ ] `package.json` tiene todas las dependencias instaladas
- [ ] `app.json` tiene configuración correcta de Android
- [ ] `versionCode` está actualizado en `app.json`
- [ ] `version` está actualizada en `app.json` y `package.json`
- [ ] Iconos de Android existen en `assets/images/`
- [ ] Permisos están configurados correctamente en `app.json`

### **Variables de Entorno**
- [ ] Archivo `.env` existe y está configurado
- [ ] Variables `EXPO_PUBLIC_GATEWAY_URL_*` están correctas
- [ ] `EXPO_PUBLIC_STAGE` está en `dev` para testing
- [ ] Si usas EAS Build, variables están en `eas.json`

### **Build Configuration**
- [ ] `eas.json` existe y está configurado (si usas EAS Build)
- [ ] Keystore existe y está configurado (si usas build local)
- [ ] `gradle.properties` tiene las credenciales (si usas build local)

### **Testing Local**
- [ ] La app funciona correctamente en desarrollo (`yarn start`)
- [ ] Los flujos principales están probados
- [ ] La conexión con la API funciona
- [ ] No hay errores en la consola

### **Documentación**
- [ ] Changelog actualizado con los cambios de esta versión
- [ ] Instrucciones de instalación preparadas para testers
- [ ] Lista de testers definida

---

## 📝 Notas Adicionales

### **Versionado**

Sigue este esquema de versionado:

- **Version (app.json):** `1.0.0` (formato semántico: MAJOR.MINOR.PATCH)
- **Version Code (app.json):** `1` (número entero que incrementa en cada build)

**Ejemplo de evolución:**
```
v1.0.0 - versionCode: 1
v1.0.1 - versionCode: 2
v1.1.0 - versionCode: 3
v2.0.0 - versionCode: 4
```

### **Nombres de Archivo**

Convención recomendada para nombres de APK:

```
medisupply-movil-app-v1.0.0-build123.apk
```

O más simple:
```
medisupply-v1.0.0-testing.apk
```

### **Almacenamiento Seguro**

**Información sensible a guardar:**
- ✅ Contraseña del keystore
- ✅ Archivo `.keystore` (en lugar seguro, NO en Git)
- ✅ Credenciales de EAS/Expo (si aplica)

**Lugares recomendados:**
- 1Password / LastPass
- Bitwarden
- Documento encriptado en Google Drive
- Gestor de secretos del equipo

---

## 🎯 Resumen Rápido: Comandos Esenciales

### **EAS Build (Recomendado)**

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configurar
eas build:configure

# 4. Build APK
eas build --platform android --profile preview

# 5. Descargar
eas build:download [BUILD_ID]
```

### **Build Local**

```bash
# 1. Prebuild
npx expo prebuild --platform android

# 2. Generar keystore (solo primera vez)
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore medisupply-release-key.keystore -alias medisupply-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 3. Compilar
cd ../..
cd android
./gradlew assembleRelease

# 4. APK generada en:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisar logs:** Los logs de EAS Build están disponibles en el dashboard
2. **Verificar documentación:** [Expo Docs](https://docs.expo.dev/)
3. **Comunidad:** [Expo Forums](https://forums.expo.dev/)
4. **Crear issue:** En el repositorio del proyecto

---

## 🎉 ¡Listo para Testing!

Una vez que tengas la APK generada:

1. ✅ Verifica que la APK se instala correctamente
2. ✅ Prueba los flujos principales
3. ✅ Distribuye a tu equipo de testing
4. ✅ Recopila feedback
5. ✅ Itera y mejora

**¡Buena suerte con el testing! 🚀**

---

*Última actualización: $(date)*
*Versión del manual: 1.0.0*

