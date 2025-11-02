# 🧪 Guía de Pruebas - Frontend Clientes

## ✅ Pre-requisitos

1. **Backend funcionando**:
   ```bash
   cd C:\MISORepos\MediSupplyApp\backend
   docker-compose ps
   # Verificar que cliente-service esté healthy
   ```

2. **Datos de prueba cargados**:
   ```bash
   # Verificar que hay clientes
   curl http://localhost/api/v1/clientes/mis-clientes?gerente_id=1
   # Debería retornar 5 clientes
   ```

3. **Gerentes disponibles**:
   - Gerente 1: `gerente.colombia@medisupply.com` / `Password123!`
   - Gerente 2: `maria.rodriguez@medisupply.com` / `Password123!`
   - Gerente 3: `carlos.mendoza@medisupply.com` / `Password123!`

---

## 🚀 Iniciar la Aplicación

### Opción 1: Expo Go (Recomendado)

```bash
cd C:\MISORepos\MediSupplyApp\medisupply-movil-app

# Iniciar servidor de desarrollo
yarn start

# O específico por plataforma
yarn android  # Para Android
yarn ios      # Para iOS
yarn web      # Para navegador
```

### Opción 2: Expo en Navegador

```bash
yarn web
# Abre automáticamente en http://localhost:8081
```

---

## 📋 Caso de Prueba 1: Login y Carga de Clientes

### Pasos:
1. Abrir la app
2. Ir a Login (si no está autenticado)
3. Ingresar credenciales:
   - Email: `gerente.colombia@medisupply.com`
   - Password: `Password123!`
4. Presionar "Iniciar Sesión"

### Resultado Esperado:
✅ Redirect automático a pantalla "Mis Clientes"  
✅ Muestra loading spinner inicialmente  
✅ Carga 5 clientes de Colombia  
✅ Cada card muestra:
   - Nombre del cliente
   - Tipo de institución
   - Dirección completa
   - Teléfono
   - Contacto principal
   - Email
   - Fecha de actualización

### Clientes Esperados (Gerente 1):
1. Centro de Salud Norte - Barranquilla
2. Clínica La Esperanza - Bucaramanga
3. Hospital San Juan - Bogotá
4. IPS Salud Total - Cali
5. IPS Vida Plena - Bogotá

---

## 🔍 Caso de Prueba 2: Búsqueda

### Pasos:
1. En la pantalla de clientes
2. Escribir en el campo de búsqueda: "Hospital"
3. Observar resultados

### Resultado Esperado:
✅ Lista se filtra en tiempo real  
✅ Muestra solo "Hospital San Juan"  
✅ Contador muestra: "1 cliente encontrado de 5 total"  

### Más búsquedas:
- "Bogotá" → 2 clientes (Hospital San Juan, IPS Vida Plena)
- "Clínica" → 1 cliente (Clínica La Esperanza)
- "IPS" → 2 clientes (IPS Salud Total, IPS Vida Plena)

---

## 🔄 Caso de Prueba 3: Pull to Refresh

### Pasos:
1. En la lista de clientes
2. Deslizar hacia abajo desde el top
3. Soltar

### Resultado Esperado:
✅ Aparece indicador de refreshing  
✅ Hace nueva petición al backend  
✅ Actualiza la lista  
✅ Indicador desaparece  

---

## 👥 Caso de Prueba 4: Diferentes Gerentes

### Gerente 2 (María - Colombia)

1. Logout del gerente 1
2. Login con: `maria.rodriguez@medisupply.com` / `Password123!`
3. Ver clientes

**Clientes esperados (5)**:
1. Clínica del Rosario - Medellín
2. EPS Salud Vital - Bogotá
3. Hospital Infantil - Medellín
4. Hospital Universitario - Cali
5. Laboratorio Clínico Central - Bogotá

### Gerente 3 (Carlos - Perú)

1. Login con: `carlos.mendoza@medisupply.com` / `Password123!`
2. Ver clientes

**Clientes esperados (4)**:
1. Centro de Salud Cusco
2. Hospital Honorio Delgado - Arequipa
3. Hospital Nacional Dos de Mayo - Lima
4. IPS Lima Norte

---

## ⚠️ Caso de Prueba 5: Manejo de Errores

### Error de Conexión

1. Detener el backend:
   ```bash
   docker-compose stop cliente-service
   ```

2. En la app, hacer pull to refresh

**Resultado esperado**:
✅ Muestra mensaje de error  
✅ Botón "Reintentar" visible  
✅ No crashea la app  

3. Reiniciar backend y presionar "Reintentar"

**Resultado esperado**:
✅ Carga los clientes correctamente  

---

## 📊 Caso de Prueba 6: Logs de Consola

### Logs Esperados al Cargar Clientes:

```
📋 Cargando clientes del gerente 1...
📋 [Actions] Obteniendo clientes del gerente 1
🌐 [CLIENTES API] GET http://localhost/api/v1/clientes/mis-clientes
   Params: { gerente_id: 1, activo: true }
✅ [CLIENTES API] 200 /api/v1/clientes/mis-clientes
   Data: { total: 5, count: 5 }
✅ [Actions] Gerente 1 tiene 5 clientes asignados
✅ 5 clientes cargados
```

---

## 🎯 Checklist de Verificación Final

- [ ] Login redirige correctamente según rol
- [ ] Gerentes con rol `gerente_cuenta` van a /clientes
- [ ] Se cargan clientes automáticamente
- [ ] Muestra loading spinner mientras carga
- [ ] Muestra los clientes asignados al gerente
- [ ] Contador de resultados correcto
- [ ] Búsqueda filtra en tiempo real
- [ ] Pull to refresh funciona
- [ ] Manejo de errores implementado
- [ ] No hay errores en consola
- [ ] ClientCard muestra toda la información
- [ ] UI responsive y fluida

---

## 🐛 Troubleshooting

### Problema: "No se pudo conectar al servidor"

**Solución**:
1. Verificar que el backend esté corriendo
2. Verificar la URL en `constants/config.ts`
3. Para Android emulador, usar `http://10.0.2.2`
4. Para dispositivo físico, usar IP de la máquina

### Problema: "No hay usuario autenticado"

**Solución**:
1. Hacer login primero
2. Verificar que el usuario tenga rol `gerente_cuenta`
3. Verificar AuthStore en DevTools

### Problema: "0 clientes asignados"

**Solución**:
1. Verificar en backend que el gerente tenga asignaciones:
   ```sql
   SELECT * FROM gerente_cuenta_clientes WHERE gerente_id = 1;
   ```
2. Ejecutar seed si es necesario:
   ```bash
   docker-compose restart cliente-service
   ```

---

## 📝 Comandos Útiles

```bash
# Ver logs del backend
cd C:\MISORepos\MediSupplyApp\backend
docker-compose logs cliente-service -f

# Reiniciar backend
docker-compose restart cliente-service

# Limpiar cache de React Native
cd C:\MISORepos\MediSupplyApp\medisupply-movil-app
yarn start -c

# Reinstalar dependencias
yarn install
```

---

¡Sigue esta guía para probar completamente la funcionalidad! 🚀

