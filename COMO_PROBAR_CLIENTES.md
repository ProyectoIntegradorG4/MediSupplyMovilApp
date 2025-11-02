# 🚀 Cómo Probar la Funcionalidad de Clientes

## ✅ Implementación Completa

La funcionalidad de consulta de clientes está **100% implementada** y lista para probar.

---

## 📋 Pre-requisitos

### 1. Backend Corriendo

```bash
# Terminal 1: Iniciar backend
cd C:\MISORepos\MediSupplyApp\backend
docker-compose up -d

# Verificar que cliente-service esté healthy
docker-compose ps cliente-service

# Verificar endpoint
curl http://localhost/api/v1/clientes/mis-clientes?gerente_id=1
```

**Debe retornar**: 5 clientes de Colombia

---

### 2. Frontend Configurado

```bash
# Terminal 2: Iniciar app móvil
cd C:\MISORepos\MediSupplyApp\medisupply-movil-app

# Instalar dependencias (si es necesario)
yarn install

# Iniciar servidor de desarrollo
yarn start
```

---

## 🎯 Pasos para Probar

### Paso 1: Abrir la App

```bash
# Opción A: Web (más fácil para probar)
yarn web
# Abre en http://localhost:8081

# Opción B: Android Emulator
yarn android

# Opción C: iOS Simulator
yarn ios
```

---

### Paso 2: Login con Gerente de Cuenta

**Credenciales del Gerente 1 (Colombia)**:
- Email: `gerente.colombia@medisupply.com`
- Password: `Password123!`

**Qué debería pasar**:
1. Login exitoso
2. Redirect automático a pantalla "Mis Clientes"
3. Aparece loading spinner
4. Se cargan 5 clientes de Colombia

---

### Paso 3: Verificar Lista de Clientes

**Deberías ver**:

```
┌─────────────────────────────┐
│ Mis Clientes                │
│ Juan Gerente Colombia       │
├─────────────────────────────┤
│ 🔍 Buscar...                │
├─────────────────────────────┤
│ 5 clientes encontrados      │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Hospital San Juan [H]   │ │
│ │ 📍 Calle 10, Bogotá     │ │
│ │ ☎ +57 1 234 5678       │ │
│ │ 👤 Dr. Carlos Pérez    │ │
│ │ 📧 contacto@...        │ │
│ │ 📅 Actualizado: ...    │ │
│ │ [Registrar Visita  →]  │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ IPS Salud Total   [IPS] │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
│ ...                         │
└─────────────────────────────┘
```

---

### Paso 4: Probar Búsqueda

1. **Buscar "Hospital"**:
   - Escribir en campo de búsqueda
   - Debería mostrar: "1 cliente encontrado de 5 total"
   - Solo aparece: Hospital San Juan

2. **Buscar "Bogotá"**:
   - Debería mostrar 2 clientes:
     - Hospital San Juan
     - IPS Vida Plena

3. **Buscar "Clínica"**:
   - Debería mostrar 1 cliente:
     - Clínica La Esperanza

---

### Paso 5: Probar Pull to Refresh

1. Deslizar hacia abajo desde el top de la lista
2. Aparece indicador de refreshing
3. Lista se recarga desde el servidor
4. Indicador desaparece

---

### Paso 6: Probar con Diferentes Gerentes

#### Gerente 2 (María - Colombia)

1. Logout
2. Login con:
   - Email: `maria.rodriguez@medisupply.com`
   - Password: `Password123!`

**Debería ver 5 clientes DIFERENTES**:
- Clínica del Rosario - Medellín
- EPS Salud Vital - Bogotá
- Hospital Infantil - Medellín
- Hospital Universitario - Cali
- Laboratorio Clínico Central - Bogotá

#### Gerente 3 (Carlos - Perú)

1. Login con:
   - Email: `carlos.mendoza@medisupply.com`
   - Password: `Password123!`

**Debería ver 4 clientes de PERÚ**:
- Centro de Salud Cusco
- Hospital Honorio Delgado - Arequipa
- Hospital Nacional Dos de Mayo - Lima
- IPS Lima Norte

---

## 🔍 Logs Esperados en Consola

```
=== Al montar el componente ===
📋 Cargando clientes del gerente 1...
📋 [Actions] Obteniendo clientes del gerente 1
🌐 [CLIENTES API] GET http://localhost/api/v1/clientes/mis-clientes
   Params: { gerente_id: 1, activo: true }
✅ [CLIENTES API] 200 /api/v1/clientes/mis-clientes
   Data: { total: 5, count: 5 }
✅ [Actions] Gerente 1 tiene 5 clientes asignados
✅ 5 clientes cargados

=== Al buscar "Hospital" ===
(Sin logs - filtrado local)

=== Al hacer pull to refresh ===
📋 Cargando clientes del gerente 1...
🌐 [CLIENTES API] GET ...
✅ 5 clientes cargados
```

---

## ⚠️ Problemas Comunes

### "No se pudo conectar al servidor"

**Causa**: Backend no accesible desde la app

**Soluciones**:
1. Verificar que docker-compose esté corriendo
2. En Android Emulator, usar: `http://10.0.2.2`
3. En dispositivo físico, usar IP de la máquina: `http://192.168.X.X`
4. Verificar que puerto 80 (nginx) esté accesible

### "0 clientes asignados"

**Causa**: El gerente no tiene clientes asignados en la BD

**Solución**:
```bash
# Verificar asignaciones en backend
cd C:\MISORepos\MediSupplyApp\backend
docker exec -i postgres-db psql -U postgres -d cliente_db -c "SELECT * FROM gerente_cuenta_clientes WHERE gerente_id = 1;"

# Si está vacío, reiniciar cliente-service para ejecutar seeds
docker-compose restart cliente-service
```

### "Cannot find module '@/core/clientes/...'"

**Causa**: Archivos nuevos no reconocidos

**Solución**:
```bash
# Reiniciar Metro bundler
yarn start -c
```

---

## 📊 Casos de Prueba

| # | Descripción | Resultado Esperado |
|---|-------------|-------------------|
| 1 | Login como gerente_cuenta | Redirect a /clientes |
| 2 | Carga automática | 5 clientes mostrados |
| 3 | Búsqueda "Hospital" | 1 cliente filtrado |
| 4 | Búsqueda "Bogotá" | 2 clientes filtrados |
| 5 | Pull to refresh | Lista recargada |
| 6 | Gerente diferente | Clientes diferentes |
| 7 | Sin conexión | Mensaje de error + Reintentar |

---

## ✅ Checklist Final

- [ ] Backend corriendo y accesible
- [ ] App móvil iniciada sin errores
- [ ] Login funcional
- [ ] Redirect a /clientes automático
- [ ] Lista de clientes cargada
- [ ] Búsqueda filtra correctamente
- [ ] Pull to refresh funciona
- [ ] No hay errores en consola
- [ ] ClientCard muestra toda la info
- [ ] Probado con al menos 2 gerentes

---

¡Sigue estos pasos y la funcionalidad debería funcionar perfectamente! 🚀

