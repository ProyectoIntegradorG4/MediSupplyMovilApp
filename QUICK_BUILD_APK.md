# ⚡ Guía Rápida: Build APK para Testing

> **Referencia rápida** - Para instrucciones detalladas, consulta [MANUAL_BUILD_APK.md](./MANUAL_BUILD_APK.md)

## 🚀 Método Rápido: EAS Build (Recomendado)

```bash
# 1. Instalar EAS CLI (solo primera vez)
npm install -g eas-cli

# 2. Login en Expo (solo primera vez)
eas login

# 3. Configurar EAS (solo primera vez)
cp eas.json.example eas.json
# Editar eas.json con tus variables de entorno

# 4. Verificar configuración
yarn build:apk:check

# 5. Build APK
yarn build:apk:eas

# 6. Descargar APK desde el dashboard de Expo
```

## 📋 Checklist Pre-Build

- [ ] `app.json` tiene `package` y `versionCode` configurados
- [ ] Variables de entorno configuradas en `eas.json` o `.env`
- [ ] `versionCode` incrementado si es un nuevo build
- [ ] Dependencias instaladas (`yarn install`)
- [ ] Configuración verificada (`yarn build:apk:check`)

## 🔧 Comandos Útiles

```bash
# Verificar configuración
yarn build:apk:check

# Build con EAS
yarn build:apk:eas

# Build local (requiere Android Studio)
yarn build:apk:local

# Script interactivo
bash ./scripts/build-apk.sh        # Linux/macOS
.\scripts\build-apk.ps1              # Windows
```

## 📱 Instalación en Dispositivo

1. Descargar APK
2. Habilitar "Instalar aplicaciones de fuentes desconocidas" en Android
3. Abrir el archivo APK
4. Seguir instrucciones de instalación

## ⚠️ Problemas Comunes

**Error: "eas.json no existe"**
```bash
cp eas.json.example eas.json
```

**Error: "package no configurado"**
- Agregar `"package": "com.medisupply.movilapp"` en `app.json` → `expo.android`

**Error: "versionCode no configurado"**
- Agregar `"versionCode": 1` en `app.json` → `expo.android`

**APK no se instala**
- Desinstalar versión anterior primero
- Habilitar "Fuentes desconocidas" en Android

## 📚 Documentación Completa

- **Manual Completo:** [MANUAL_BUILD_APK.md](./MANUAL_BUILD_APK.md)
- **Configuración:** [CONFIG.md](./CONFIG.md)
- **README Principal:** [README.md](./README.md)

---

*Para más detalles, consulta el manual completo.*

