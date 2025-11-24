# 🔧 Solución: Error "TypeError: fetch failed" en Expo Start

## 📋 Problema

Al ejecutar `yarn start --clear`, Expo CLI intenta conectarse a los servidores de Expo para validar las versiones de dependencias nativas, pero falla con el error:

```
TypeError: fetch failed
```

Este error puede ocurrir por:
- ❌ Problemas de conectividad a internet
- ❌ Firewall o proxy bloqueando las peticiones
- ❌ Servidores de Expo temporalmente fuera de servicio
- ❌ Configuración de red corporativa restrictiva

## ✅ Soluciones Implementadas

### **Solución 1: Modo Offline (Recomendada)**

Los scripts en `package.json` ahora usan el flag `--offline` por defecto:

```bash
# Iniciar en modo offline (por defecto)
yarn start

# Si necesitas validación en línea, usa:
yarn start:online
```

### **Solución 2: Variables de Entorno**

Se han agregado variables de entorno en `env.example` para deshabilitar validaciones:

```env
# Deshabilitar validaciones en línea de Expo
EXPO_NO_UPDATE_CHECK=1
EXPO_NO_TELEMETRY=1
EXPO_OFFLINE=1
```

**Pasos para aplicar:**

1. Copia el archivo `.env.example` a `.env` (si no existe):
   ```bash
   cp env.example .env
   ```

2. Asegúrate de que tu archivo `.env` incluya estas variables.

### **Solución 3: Comando Directo**

Puedes ejecutar directamente con el flag `--offline`:

```bash
# Con yarn
yarn expo start --offline --clear

# Con npx
npx expo start --offline --clear
```

## 🚀 Uso Normal

Después de aplicar las soluciones, simplemente ejecuta:

```bash
yarn start --clear
```

O para iniciar con una plataforma específica:

```bash
yarn android  # Android
yarn ios      # iOS
yarn web      # Web
```

Todos estos comandos ahora funcionan en modo offline por defecto.

## 📝 Notas Importantes

- ⚠️ **Modo Offline**: En modo offline, Expo no validará las versiones de dependencias contra los servidores de Expo. Esto es seguro para desarrollo local.
- ✅ **Funcionalidad Completa**: El modo offline no afecta la funcionalidad de desarrollo, solo desactiva las validaciones en línea.
- 🔄 **Actualizaciones**: Si necesitas actualizar dependencias, usa `yarn start:online` o ejecuta `npx expo install --fix` manualmente.

## 🐛 Troubleshooting Adicional

Si el problema persiste:

1. **Verificar conexión a internet:**
   ```bash
   ping expo.dev
   ```

2. **Limpiar caché de Expo:**
   ```bash
   npx expo start --clear
   ```

3. **Verificar configuración de proxy (si aplica):**
   ```bash
   echo $HTTP_PROXY
   echo $HTTPS_PROXY
   ```

4. **Reinstalar dependencias:**
   ```bash
   rm -rf node_modules
   yarn install
   ```

5. **Verificar versión de Expo CLI:**
   ```bash
   npx expo --version
   ```

## 📚 Referencias

- [Expo CLI Documentation](https://docs.expo.dev/workflow/expo-cli/)
- [Expo Offline Mode](https://docs.expo.dev/workflow/offline-support/)

