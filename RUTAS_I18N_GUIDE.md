# Guía de Internacionalización - Módulo de Rutas

## ✅ Implementación Completada

Se ha implementado la internacionalización completa para el módulo de Rutas de Visitas, soportando **Español** e **Inglés**.

---

## 📋 Archivos Modificados

### 1. Traducciones

#### `core/i18n/locales/es/translation.json`
- ✅ Agregada sección `routes` con todas las traducciones en español
- ✅ Agregado `common.retry` para botón de reintentar

#### `core/i18n/locales/en/translation.json`
- ✅ Agregada sección `routes` con todas las traducciones en inglés
- ✅ Agregado `common.retry` para botón retry

### 2. Utilidades

#### `core/rutas/interface/ruta.ts`
- ✅ `formatFechaLarga()` ahora acepta parámetro `locale` (default: 'es-ES')
- ✅ `formatFechaCorta()` ahora acepta parámetro `locale` (default: 'es-ES')
- ✅ `formatHora()` ahora acepta parámetro `locale` (default: 'es-ES')
- ✅ `formatDuracion()` ahora acepta parámetro `shortFormat` para formato corto/largo

### 3. Componentes

#### `presentation/rutas/components/DateSelector.tsx`
- ✅ Usa `useTranslation()` hook
- ✅ Label del selector traducido: `t('routes.dateLabel')`
- ✅ Botón "Listo/Done" traducido según idioma
- ✅ Date picker nativo con locale correcto (es-ES / en-US)
- ✅ Formato de fecha largo según idioma seleccionado

#### `presentation/rutas/components/VisitCard.tsx`
- ✅ Usa `useTranslation()` hook
- ✅ "Duración" traducida: `t('routes.duration')`
- ✅ "desde anterior" traducida: `t('routes.fromPrevious')`
- ✅ Prioridades traducidas: ALTA/HIGH, MEDIA/MEDIUM, BAJA/LOW
- ✅ Label "Prioridad/Priority" traducido
- ✅ Formato de duración según idioma

#### `app/(products-app)/(rutas)/index.tsx`
- ✅ Usa `useTranslation()` hook
- ✅ Título: `t('routes.title')`
- ✅ Rol: `t('routes.accountManager')`
- ✅ Estados de carga, error y sin visitas traducidos
- ✅ Resumen de ruta completamente traducido
- ✅ Botones y mensajes traducidos
- ✅ Tipos de origen traducidos (planificada/planned, recalculada/recalculated, manual)

---

## 🌍 Traducciones Disponibles

### Español (es)

```json
{
  "routes": {
    "title": "Ruta de Visitas",
    "accountManager": "Gerente de Cuenta",
    "dateLabel": "Fecha de la ruta",
    "loadingRoute": "Cargando ruta...",
    "errorTitle": "Error",
    "restrictedAccess": "Acceso Restringido",
    "restrictedMessage": "Esta funcionalidad es exclusiva para Gerentes de Cuenta",
    "noVisitsTitle": "No hay visitas programadas",
    "noVisitsMessage": "No tienes visitas asignadas para esta fecha.",
    "summaryTitle": "Resumen de la ruta",
    "visits": "Visitas",
    "totalTime": "Tiempo total",
    "distance": "Distancia",
    "schedule": "Horario",
    "scheduledVisits": "Visitas programadas",
    "optimizedRoute": "Ruta optimizada - Versión {{version}}",
    "origin": "Origen: {{origin}}",
    "priorities": {
      "high": "ALTA",
      "medium": "MEDIA",
      "low": "BAJA",
      "label": "Prioridad"
    },
    "duration": "Duración",
    "fromPrevious": "desde anterior",
    "originTypes": {
      "planned": "planificada",
      "recalculated": "recalculada",
      "manual": "manual"
    }
  }
}
```

### Inglés (en)

```json
{
  "routes": {
    "title": "Visit Route",
    "accountManager": "Account Manager",
    "dateLabel": "Route date",
    "loadingRoute": "Loading route...",
    "errorTitle": "Error",
    "restrictedAccess": "Restricted Access",
    "restrictedMessage": "This feature is exclusive for Account Managers",
    "noVisitsTitle": "No scheduled visits",
    "noVisitsMessage": "You have no assigned visits for this date.",
    "summaryTitle": "Route summary",
    "visits": "Visits",
    "totalTime": "Total time",
    "distance": "Distance",
    "schedule": "Schedule",
    "scheduledVisits": "Scheduled visits",
    "optimizedRoute": "Optimized route - Version {{version}}",
    "origin": "Origin: {{origin}}",
    "priorities": {
      "high": "HIGH",
      "medium": "MEDIUM",
      "low": "LOW",
      "label": "Priority"
    },
    "duration": "Duration",
    "fromPrevious": "from previous",
    "originTypes": {
      "planned": "planned",
      "recalculated": "recalculated",
      "manual": "manual"
    }
  }
}
```

---

## 🧪 Cómo Probar

### 1. Cambiar el idioma de la aplicación

Desde la app móvil:
1. Ir a la pestaña **Perfil**
2. En la sección **Idioma**, seleccionar **Español** o **English**
3. La app cambiará automáticamente

### 2. Verificar elementos traducidos

#### En Español:
- **Título**: "Ruta de Visitas"
- **Rol**: "Gerente de Cuenta"
- **Fecha**: "lunes, 25 de noviembre de 2025"
- **Selector de fecha**: "Fecha de la ruta"
- **Sin visitas**: "No hay visitas programadas"
- **Resumen**: "Resumen de la ruta"
- **Labels**: "Visitas", "Tiempo total", "Distancia", "Horario"
- **Prioridades**: "Prioridad ALTA", "Prioridad MEDIA", "Prioridad BAJA"
- **Duración**: "2h 30min"

#### En Inglés:
- **Title**: "Visit Route"
- **Role**: "Account Manager"
- **Date**: "Monday, November 25, 2025"
- **Date selector**: "Route date"
- **No visits**: "No scheduled visits"
- **Summary**: "Route summary"
- **Labels**: "Visits", "Total time", "Distance", "Schedule"
- **Priorities**: "Priority HIGH", "Priority MEDIUM", "Priority LOW"
- **Duration**: "2 hours 30 minutes"

---

## 🎯 Características Implementadas

### ✅ Formato de Fechas
- Automáticamente adapta el formato según el idioma
- Español: "lunes, 25 de noviembre de 2025"
- Inglés: "Monday, November 25, 2025"

### ✅ Formato de Duraciones
- Español: formato corto "2h 30min"
- Inglés: formato largo "2 hours 30 minutes"

### ✅ Date Picker Nativo
- iOS y Android muestran el calendario en el idioma correcto
- Español: locale `es-ES`
- Inglés: locale `en-US`

### ✅ Traducciones Dinámicas
- Uso de interpolación: `{{version}}`, `{{origin}}`
- Traducciones anidadas para prioridades y tipos de origen

### ✅ Estados de UI
- Loading: "Cargando ruta..." / "Loading route..."
- Error: "Error" + botón "Reintentar" / "Retry"
- Empty: "No hay visitas programadas" / "No scheduled visits"
- Success: Todo el contenido traducido

---

## 📝 Notas Técnicas

### Hook de Traducción
```typescript
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

const { t, locale } = useTranslation();

// Uso básico
t('routes.title') // "Ruta de Visitas" o "Visit Route"

// Con interpolación
t('routes.optimizedRoute', { version: 6 }) 
// "Ruta optimizada - Versión 6" o "Optimized route - Version 6"

// Anidadas
t(`routes.originTypes.${rutaData.origen_ruta}`)
// "planificada" o "planned"
```

### Formato de Fechas con Locale
```typescript
const dateLocale = locale === 'en' ? 'en-US' : 'es-ES';
const formattedDate = formatFechaLarga(dateString, dateLocale);
```

### Formato de Duraciones
```typescript
// Español: formato corto
formatDuracion(150, true) // "2h 30min"

// Inglés: formato largo
formatDuracion(150, false) // "2 hours 30 minutes"
```

---

## ✅ Checklist de Verificación

- [x] Traducciones en español agregadas
- [x] Traducciones en inglés agregadas
- [x] DateSelector internacionalizado
- [x] VisitCard internacionalizado
- [x] Pantalla principal internacionalizada
- [x] Formatos de fecha adaptados al locale
- [x] Formatos de duración adaptados al locale
- [x] Date picker nativo con locale correcto
- [x] Prioridades traducidas
- [x] Estados de UI traducidos
- [x] Sin errores de linting
- [x] Compatible con cambio dinámico de idioma

---

## 🚀 Para Agregar Nuevas Traducciones

Si en el futuro necesitas agregar más textos traducibles:

1. **Agregar la key en ambos archivos de traducción**:
   - `core/i18n/locales/es/translation.json`
   - `core/i18n/locales/en/translation.json`

2. **Usar el hook en el componente**:
   ```typescript
   const { t } = useTranslation();
   ```

3. **Reemplazar texto hardcodeado**:
   ```typescript
   // Antes
   <ThemedText>Texto en español</ThemedText>
   
   // Después
   <ThemedText>{t('routes.miNuevaKey')}</ThemedText>
   ```

---

## 📞 Soporte

La internacionalización está completamente integrada con el sistema i18n existente de la aplicación. Cualquier cambio de idioma desde el Perfil afectará automáticamente al módulo de Rutas.

