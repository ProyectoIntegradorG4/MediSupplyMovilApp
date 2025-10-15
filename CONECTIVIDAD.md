# 🔧 Guía de Resolución de Problemas de Conectividad

## Problema Identificado

La aplicación móvil no puede conectarse a la API en `http://localhost:8001` porque en Android, `localhost` se refiere al dispositivo mismo, no al servidor de desarrollo.

## ✅ Soluciones Implementadas

### 1. Configuración de URLs Actualizada

Se actualizó la configuración en `constants/config.ts` para usar URLs correctas:

- **Android Emulator**: `http://10.0.2.2:8001`
- **Android Físico**: `http://192.168.5.107:8001` (IP de tu máquina)
- **iOS Simulator**: `http://192.168.5.107:8001`
- **Web**: `http://localhost:8001`

### 2. Sistema de Fallback Mejorado

La aplicación ahora prueba automáticamente múltiples URLs en este orden:
1. `http://10.0.2.2:8001` (Emulador Android)
2. `http://192.168.1.7:8001` (IP alternativa)
3. `http://192.168.5.107:8001` (IP del docker-compose)
4. `http://localhost:8001` (Solo para web)
5. `http://127.0.0.1:8001` (Solo para web)

### 3. Diagnóstico de Conectividad

Se agregó un script de diagnóstico:

```bash
yarn diagnose
```

Este script:
- Muestra las interfaces de red disponibles
- Prueba la conectividad con diferentes URLs
- Proporciona recomendaciones específicas

## 🚀 Cómo Usar

### Para Desarrollo Local

1. **Ejecutar el script de diagnóstico:**
   ```bash
   yarn diagnose
   ```

2. **Verificar que tu API esté corriendo en el puerto 8001:**
   ```bash
   curl http://localhost:8001/health
   ```

3. **Para Android Emulator:**
   - La aplicación usará automáticamente `http://10.0.2.2:8001`
   - No se requiere configuración adicional

4. **Para Android Físico:**
   - Asegúrate de que el dispositivo esté en la misma red WiFi
   - La aplicación probará automáticamente la IP de tu máquina

5. **Para iOS Simulator:**
   - La aplicación usará la IP de tu máquina automáticamente

### Solución Alternativa con ADB (Android)

Si sigues teniendo problemas, puedes usar ADB reverse:

```bash
# Conectar dispositivo Android por USB
adb reverse tcp:8001 tcp:8001

# Verificar que funciona
adb reverse --list
```

## 🔍 Verificación

Después de implementar estos cambios, deberías ver en los logs:

```
🔍 Probando conectividad con URLs: ["http://10.0.2.2:8001", ...]
🌐 Probando: http://10.0.2.2:8001
✅ URL funcionando: http://10.0.2.2:8001
```

## 📱 Configuración por Plataforma

| Plataforma | URL por Defecto | Fallback |
|------------|----------------|----------|
| Android Emulator | `10.0.2.2:8001` | IPs de red local |
| Android Físico | `10.0.2.2:8001` | IPs de red local |
| iOS Simulator | `192.168.5.107:8001` | `localhost:8001` |
| Web | `localhost:8001` | `127.0.0.1:8001` |

## 🐛 Troubleshooting

### Error: "URL no disponible"

1. Verifica que tu API esté corriendo:
   ```bash
   curl http://localhost:8001/health
   ```

2. Verifica la IP de tu máquina:
   ```bash
   ipconfig  # Windows
   ifconfig  # macOS/Linux
   ```

3. Ejecuta el diagnóstico:
   ```bash
   yarn diagnose
   ```

### Error: "Network Error"

1. Verifica que el dispositivo esté en la misma red
2. Verifica que el firewall no esté bloqueando el puerto 8001
3. Prueba con ADB reverse (solo Android)

### Error: "Metro InternalBytecode.js"

Este es un error secundario de Metro bundler que se resuelve automáticamente cuando se soluciona el problema de conectividad principal.

## 📞 Soporte

Si sigues teniendo problemas:

1. Ejecuta `yarn diagnose` y comparte la salida
2. Verifica que tu API esté funcionando con Postman
3. Revisa los logs de la aplicación para ver qué URL está usando

