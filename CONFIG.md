# Configuración de la Aplicación MediSupply Mobile

## Variables de Entorno

Para configurar la aplicación móvil para que se conecte correctamente al servicio de usuarios, necesitas configurar las siguientes variables de entorno:

### Variables Requeridas

```env
# Entorno de ejecución
EXPO_PUBLIC_STAGE=dev

# URLs del servicio de usuarios (puerto 8001)
EXPO_PUBLIC_API_URL=http://localhost:8001
EXPO_PUBLIC_API_URL_IOS=http://localhost:8001
EXPO_PUBLIC_API_URL_ANDROID=http://10.0.2.2:8001

# Debug mode
EXPO_DEBUG=true
```

### Configuración por Entorno

#### Desarrollo Local
- **iOS**: `http://localhost:8001`
- **Android**: La aplicación probará automáticamente estas URLs:
  - `http://10.0.2.2:8001` (IP del host desde el emulador)
  - `http://192.168.1.7:8001` (IP real de la máquina)
  - `http://localhost:8001`
  - `http://127.0.0.1:8001`
- **Web**: `http://localhost:8001`

#### Producción
```env
EXPO_PUBLIC_STAGE=prod
EXPO_PUBLIC_API_URL=https://api.medisupply.com
```

## Servicios Integrados

### User Service (Puerto 8001)
La aplicación móvil ahora está configurada para consumir el servicio de usuarios que corre en el puerto 8001.

#### Endpoints Utilizados:
- `POST /register` - Registro de nuevos usuarios

#### Formato de Datos:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@empresa.com",
  "nit": "1234567890",
  "password": "MiPassword123!"
}
```

#### Respuesta Exitosa:
```json
{
  "userId": 1,
  "institucionId": 1,
  "rol": "usuario_institucional",
  "token": "jwt_token_here",
  "mensaje": "Registro exitoso"
}
```

## Validaciones Implementadas

### Contraseña
La validación de contraseña se alinea con las reglas del servicio:
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un carácter especial

### NIT
- Formato colombiano (9-10 dígitos)
- Validación con el servicio de validación de NIT

### Email
- Formato de email válido
- Verificación de unicidad en el servicio

## Manejo de Errores

La aplicación maneja diferentes tipos de errores del servicio:

1. **Reglas de negocio fallidas** (422) - Validación de contraseña
2. **NIT no autorizado** (404) - NIT no encontrado en instituciones
3. **Usuario ya existe** (409) - Email duplicado
4. **Error interno** (500) - Errores del servidor

## Solución de Problemas de Conectividad

### Error "Network Error" en Android

Si ves errores de conexión en Android, la aplicación intentará automáticamente diferentes URLs:

1. **Detección automática**: La app probará múltiples URLs hasta encontrar una que funcione
2. **Logs de debugging**: Revisa los logs para ver qué URL está siendo utilizada
3. **Variables de entorno**: Puedes forzar una URL específica con `EXPO_PUBLIC_API_URL_ANDROID`

### Verificar que el Servicio está Corriendo

```bash
# Verificar que el servicio responde
curl http://localhost:8001/health

# Verificar que el puerto está abierto
netstat -ano | findstr :8001
```

### URLs de Fallback para Android

La aplicación probará estas URLs en orden:
1. `http://10.0.2.2:8001` - Emulador estándar
2. `http://192.168.1.7:8001` - IP real de tu máquina
3. `http://localhost:8001` - Localhost
4. `http://127.0.0.1:8001` - Loopback

## Inicio Rápido

1. Asegúrate de que el servicio de usuarios esté corriendo en el puerto 8001
2. Configura las variables de entorno según tu plataforma (opcional)
3. Ejecuta la aplicación móvil
4. El formulario de registro se conectará automáticamente al servicio
