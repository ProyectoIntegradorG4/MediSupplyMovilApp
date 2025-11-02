# ⚡ Quick Start - Probar Clientes en 5 Minutos

## 🎯 Objetivo

Probar la funcionalidad de consulta de clientes conectando frontend con backend.

---

## 🚀 Paso 1: Iniciar Backend (2 minutos)

```powershell
# Terminal PowerShell
cd C:\MISORepos\MediSupplyApp\backend
docker-compose up -d

# Esperar 10 segundos
Start-Sleep -Seconds 10

# Verificar
curl.exe http://localhost/health/cliente
```

**Debe retornar**: `{"status":"healthy",...}`

---

## 📱 Paso 2: Iniciar Frontend (2 minutos)

```powershell
# Nueva terminal PowerShell
cd C:\MISORepos\MediSupplyApp\medisupply-movil-app

# Iniciar (opción más fácil: web)
yarn web
```

**Se abre**: http://localhost:8081 en el navegador

---

## 🔐 Paso 3: Login (30 segundos)

En la app web:

1. Ir a Login
2. Ingresar:
   - **Email**: `gerente.colombia@medisupply.com`
   - **Password**: `Password123!`
3. Presionar "Iniciar Sesión"

**Resultado**: Redirect automático a pantalla "Mis Clientes"

---

## ✅ Paso 4: Verificar (30 segundos)

Deberías ver:

```
Mis Clientes
Juan Gerente Colombia

🔍 [Buscar cliente, ciudad, contacto...]

5 clientes encontrados

┌─────────────────────────────┐
│ Hospital San Juan      [Hospital]
│ 📍 Calle 10 # 20-30, Bogotá, Cundinamarca
│ ☎ +57 1 234 5678
│ 👤 Dr. Carlos Pérez - Director de Compras
│ 📧 contacto@hospitalsanjuan.com
│ 📅 Actualizado: 01/11/2025
│          [Registrar Visita →]
└─────────────────────────────┘

[... 4 clientes más ...]
```

---

## 🔍 Paso 5: Probar Búsqueda (30 segundos)

1. Escribir "Hospital" en el buscador
2. Debería mostrar: "1 cliente encontrado de 5 total"
3. Solo aparece Hospital San Juan

4. Borrar y escribir "Bogotá"
5. Debería mostrar: "2 clientes encontrados de 5 total"
6. Aparecen Hospital San Juan e IPS Vida Plena

---

## 🎉 ¡LISTO!

Si ves los 5 clientes y la búsqueda funciona, **¡la implementación está completa!**

---

## 🐛 Si algo falla...

### No carga clientes

```bash
# Verificar backend
curl "http://localhost/api/v1/clientes/mis-clientes?gerente_id=1"

# Debe retornar JSON con 5 clientes
```

### Error de conexión

Verificar URL en: `medisupply-movil-app/constants/config.ts`

Para web debe ser: `http://localhost`

---

## 📝 Otras Pruebas Rápidas

### Probar Pull to Refresh
- Deslizar hacia abajo en la lista
- Lista se recarga

### Probar Otro Gerente
1. Logout
2. Login con: `maria.rodriguez@medisupply.com` / `Password123!`
3. Debería ver 5 clientes DIFERENTES

---

**Tiempo total**: ~5 minutos  
**Resultado**: Funcionalidad completa funcionando 🚀

