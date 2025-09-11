# Diseño de experimento

---

# Experimento de Registro de Clientes Institucionales desde APP Móvil con Validación de Lista Blanca

## Propósito del experimento

Validar la implementación de un sistema de registro de clientes institucionales desde APP Móvil desarrollada en React Native que integre validación automática de identificación tributaria contra una lista blanca precargada, con gestión automática de roles y cumplimiento de atributos de calidad críticos: latencia (<1 segundo), seguridad (autenticación y autorización) y usabilidad (interfaz intuitiva). El experimento busca probar la viabilidad técnica de React Native para este dominio crítico en la aplicación, considerando que ningún integrante del equipo tiene experiencia previa en esta tecnología.

## Resultados esperados

### Resultados Técnicos
- **Latencia**: Demostrar que React Native puede cumplir los requisitos de latencia (<1 segundo) para registro y validación requeridas.
- **Funcionalidad**: Implementar un flujo de registro que valide automáticamente contra lista blanca y asigne rol de cliente institucional.
- **Arquitectura**: Validar que la integración con microservicios backend funciona eficientemente desde React Native.

### Resultados de Negocio (basados en HU-MOV-007)
- **Registro exitoso**: 100% de representantes de instituciones médicas pueden completar el formulario de registro y recibir confirmación desde la app.
- **Validación de datos**: 100% de NIT/RUC inválidos son rechazados con mensajes de error específicos.
- **Prevención de duplicados**: 100% de clientes instituciones ya registradas son detectadas y se ofrece recuperación de credenciales.
- **Acceso a servicios**: 100% de usuarios registrados exitosamente pueden acceder a servicios de autogestión.

### Resultados de Calidad
- **Usabilidad**: Confirmar que la interfaz es intuitiva para usuarios de instituciones de salud sin capacitación técnica.
- **Seguridad**: Implementar autenticación segura y control de acceso basado en roles.
- **Disponibilidad**: 99% de disponibilidad durante pruebas de registro.

## Recursos requeridos

**Software:**
- React Native 0.72 con Expo SDK
- Visual Studio Code con extensiones React Native
- Node.js 18+, npm/yarn
- Android Studio (emuladores Android)
- Uso de Expo Go (App para probar las aplicaciones en React Native)
- Xcode (simuladores iOS - opcional)

**Backend y Servicios:**
- FastAPI (Python) para microservicios
- PostgreSQL para base de datos
- Redis para caché
- Docker para contenedores

**Hardware:**
- Dispositivos móviles Android/iOS para pruebas reales
- Máquinas de desarrollo con 16GB RAM mínimo

<!--
**Librerías específicas:**
- React Navigation para navegación
- AsyncStorage para persistencia local
- Axios para comunicación HTTP
- react-hook-form para manejo de formularios
- React Native Paper para componentes UI
-->

## Elementos de arquitectura involucrados

**ASR Asociados:**
- **Latencia** (Escenario 4): Registro de clientes institucionales con validación automática en <1 segundo 99.95% de las veces
- **Seguridad** (Escenario 2): Creación controlada de cuentas con validación y auditoría 100% de las veces
- **Usabilidad** (Escenario 2): Interfaz intuitiva y multilenguaje

**Elementos de Arquitectura:**
- **Vista Funcional**: Microservicio de gestión de usuarios, microservicio de validación tributaria
- **Vista de Información**: Flujo de datos entre app móvil, API Gateway y servicios backend
- **Vista de Despliegue**: Aplicación móvil React Native, contenedores de microservicios
- **Vista de Concurrencia**: Procesamiento asíncrono de validaciones tributarias

**Puntos de Sensibilidad:**
- Tiempo de respuesta de validación de NIT
- Capacidad de React Native para manejar validación en tiempo real
- Seguridad en transmisión y almacenamiento de datos tributarios
- Usabilidad del formulario de registro para usuarios no técnicos

## Interpretación de resultados

### Criterios de Éxito (Experimento Exitoso)
- **Latencia**: Registro completo en <1 segundo en 95% de casos
- **Funcionalidad**: 100% de criterios de aceptación de HU-MOV-007 cumplidos
- **Usabilidad**: Formulario completable en <30 segundos por usuario promedio
- **Seguridad**: 100% de validaciones de NIT correctas, 0% falsos positivos
- **Disponibilidad**: 99% de solicitudes exitosas durante pruebas
- **Aprendizaje**: Equipo puede desarrollar funcionalidad adicional en React Native

### Criterios de Ajuste Parcial (Requiere Optimización)
- **Latencia**: Registro en 1-2 segundos → optimizar caché Redis, reducir payloads
- **Funcionalidad**: 80-95% criterios cumplidos → ajustar validaciones, mejorar UX
- **Usabilidad**: Formulario en 30-60 segundos → simplificar campos, mejorar feedback
- **Seguridad**: 95-99% validaciones correctas → refinar lista blanca, mejorar algoritmos
- **Disponibilidad**: 95-99% solicitudes exitosas → ajustar timeouts, mejorar error handling

### Criterios de Fallo (Replantear Arquitectura)
- **Latencia**: Registro >2 segundos → React Native no viable, considerar web móvil
- **Funcionalidad**: <80% criterios cumplidos → arquitectura inadecuada para dominio
- **Usabilidad**: Formulario >60 segundos → interfaz inutilizable para usuarios objetivo
- **Seguridad**: <95% validaciones correctas → riesgo inaceptable para sector salud
- **Disponibilidad**: <95% solicitudes exitosas → arquitectura no confiable

## Métricas de validación específicas

### Métricas Técnicas
- **Latencia de registro**: <1 segundo (p95)
- **Latencia de validación NIT**: <200ms (p95)
- **Concurrencia**: 10 usuarios simultáneos sin degradación
<!-- - **Throughput**: 100 registros/hora sostenido
- **Disponibilidad**: 99% durante pruebas (8 horas continuas) -->

### Métricas de Negocio (HU-MOV-007)
- **Tasa de registro exitoso**: 100% con datos válidos y confirmación desde la app
- **Tasa de rechazo NIT inválido**: 100% con mensaje específico
- **Tasa de detección duplicados**: 100% con opción recuperación
- **Tiempo completar formulario**: <30 segundos (usuario promedio)
- **Tasa de abandono formulario**: <5%
- **Tiempo mostrar confirmación**: <1s después de registro exitoso

### Métricas de Calidad
- **Cobertura de pruebas**: >80%
- **Tiempo de respuesta UI**: <100ms para interacciones
- **Tasa de errores de red**: <1%
- **Satisfacción de usuario**: >4/5 en pruebas de usabilidad

## Plan de pruebas detallado

### Pruebas Unitarias (16 horas)
- **React Native Components**: Formulario, validaciones, navegación
- **Microservicios**: User Management, Tax Validation, Audit Service
- **APIs**: Endpoints de registro, validación, autenticación
- **Base de datos**: Queries, transacciones, constraints

### Pruebas de Integración (8 horas)
- **Flujo completo**: App móvil → API Gateway → Microservicios → BD
- **Validación NIT**: Lista blanca → Cache → Respuesta
- **Autenticación**: JWT → Refresh tokens → Sesiones
- **Auditoría**: Logging → Trazabilidad → Reportes

### Pruebas de Usabilidad (4 horas)
- **Dispositivos reales**: Android (3 modelos) + iOS (2 modelos)
- **Escenarios de usuario**: Registro exitoso con confirmación desde la app, error NIT, duplicado
- **Métricas UX**: Tiempo completar, errores usuario, satisfacción, tiempo mostrar confirmación
- **Accesibilidad**: Lectores de pantalla, contraste, navegación

### Pruebas de Performance (4 horas)
- **Carga**: 10 usuarios simultáneos registrándose
- **Estrés**: 50 usuarios concurrentes
- **Latencia**: Medición end-to-end con herramientas
- **Memoria**: Uso de recursos en dispositivos móviles

## Criterios de aceptación por funcionalidad

### Mobile App (React Native)
- **Formulario de registro**: Renderizado en <500ms, validación en tiempo real
- **Navegación**: Transiciones fluidas <200ms entre pantallas
- **Persistencia local**: AsyncStorage funcional para tokens y caché
- **Manejo de errores**: Mensajes claros y específicos para cada tipo de error
- **Confirmación de registro**: Pantalla de confirmación mostrada <500ms después de registro exitoso
- **Offline handling**: Funcionalidad básica sin conectividad

### User Management Service
- **Creación de usuario**: <500ms para registro completo
- **Validación de roles**: Asignación automática de rol "cliente institucional"
- **Gestión de sesiones**: JWT tokens con refresh automático
- **Prevención duplicados**: Detección 100% de instituciones ya registradas

### Tax Validation Service
- **Validación NIT**: Respuesta <200ms desde caché, <500ms desde BD
- **Lista blanca**: Carga inicial <2 segundos, actualizaciones incrementales
- **Cache Redis**: Hit rate >90% para validaciones recientes
- **Auditoría**: Logging de todas las validaciones (exitosas y fallidas)

### API Gateway
- **Rate limiting**: 100 requests/minuto por IP
- **Autenticación**: Validación JWT <100ms
- **Routing**: Latencia adicional <50ms por request
- **CORS**: Configuración correcta para React Native

### Audit Service
- **Logging**: Registro de eventos <100ms
- **Trazabilidad**: Correlación de eventos por session_id
- **Retención**: Datos auditables.
- **Reportes**: Generación de reportes de seguridad

<!-- ## Estrategia de rollback

### Rollback Automático
- **Trigger**: Error rate >5% durante 5 minutos consecutivos
- **Acción**: Desactivar endpoint de registro móvil automáticamente
- **Notificación**: Alertas inmediatas al equipo de desarrollo
- **Fallback**: Redirección a versión web de registro

### Rollback Manual
- **Trigger**: Decisiones de negocio o problemas de seguridad
- **Procedimiento**: 
  1. Desactivar feature flag de registro móvil
  2. Notificar usuarios vía push notification
  3. Migrar datos pendientes a sistema web
  4. Comunicar a stakeholders

### Plan de Contingencia
- **Versión web**: Mantener funcionalidad de registro web como backup
- **Migración de datos**: Scripts para transferir registros móviles a web
- **Comunicación**: Plan de comunicación a usuarios afectados
- **Recuperación**: Procedimiento para reactivar móvil post-corrección -->

## Monitoreo y alertas

### Métricas de Monitoreo
- **Latencia**: p50, p95, p99 de registro completo
- **Throughput**: Registros por minuto, requests por segundo
- **Errores**: Rate de errores por endpoint, tipos de error
- **Disponibilidad**: Uptime de microservicios, conectividad móvil
- **Recursos**: CPU, memoria, conexiones BD por servicio

### Alertas Críticas
- **Latencia alta**: p95 >1 segundo por 5 minutos
- **Error rate**: >5% de requests fallidos por 5 minutos
- **Disponibilidad**: Servicio down por >2 minutos
- **Cache miss**: Redis hit rate <80% por 10 minutos
- **BD connections**: Pool de conexiones >90% por 5 minutos

### Dashboards
- **Operacional**: Latencia, throughput, errores en tiempo real
- **Negocio**: Registros exitosos, abandono de formularios, satisfacción
- **Técnico**: Recursos de infraestructura, logs de aplicación
- **Móvil**: Performance de app, crashes, uso de memoria

## Documentación de APIs

### OpenAPI/Swagger
- **User Management API**: Endpoints de registro, autenticación, gestión de usuarios
- **Tax Validation API**: Validación NIT, consulta lista blanca, auditoría
- **Audit API**: Logging de eventos, reportes de seguridad
<!-- - **Mobile API**: Endpoints específicos para React Native -->

### Contratos de API
- **Request/Response schemas**: Estructura de datos para cada endpoint
- **Códigos de error**: Mapeo de errores HTTP a mensajes de usuario
- **Autenticación**: Flujo JWT, refresh tokens, manejo de sesiones
- **Rate limiting**: Límites por endpoint, headers de respuesta

### Especificaciones Técnicas
- **Endpoints móviles**: URLs, métodos HTTP, parámetros
- **Validaciones**: Reglas de negocio, formatos de datos
- **Seguridad**: Headers requeridos, certificados, CORS
- **Versionado**: Estrategia de versionado de APIs

## Esfuerzo estimado

**Total**: 32 horas hombre (8 horas por integrante)
- Desarrollo React Native: 16 horas
- Desarrollo microservicios backend: 8 horas  
- Integración y pruebas: 6 horas
- Documentación y análisis de resultados: 2 horas

---

# Hipótesis de diseño

React Native con Expo puede implementar efectivamente un sistema de registro de clientes institucionales que cumpla con los requisitos de latencia (<1 segundo), seguridad (validación automática contra lista blanca) y usabilidad (interfaz intuitiva) en el dominio de suministros médicos, sin requerir experiencia previa significativa del equipo en la tecnología.

# Punto de sensibilidad

**Principal**: Tiempo de respuesta del proceso completo de registro y validación de NIT contra lista blanca desde la aplicación móvil React Native hasta los microservicios backend.

**Secundarios**: 
- Facilidad de desarrollo para equipo sin experiencia en React Native
- Calidad de experiencia de usuario en dispositivos móviles reales
- Robustez de la validación de seguridad y gestión de roles

# Historia de arquitectura asociada

**HU-MOV-007**: Como Cliente Institucional quiero registrarme en la aplicación móvil para acceder a los servicios de autogestión y realizar pedidos.

**Criterios de Aceptación del Experimento**:
- **Registro exitoso**: Formulario completo con información válida → cuenta creada + confirmación desde la app + acceso a servicios
- **Validación de datos**: NIT/RUC inválido → mensaje error específico + formulario no se envía + solicitud corrección
- **Verificación duplicados**: Institución ya registrada → mensaje "Institución ya registrada" + opción recuperar credenciales + contacto administrador

# Nivel de incertidumbre

**Alto** - Ningún integrante del equipo tiene experiencia previa con React Native, y los requisitos de latencia y seguridad son críticos para el dominio de suministros médicos.

---

# Estilos de Arquitectura asociados al experimento

**Microservicios**: Separación de responsabilidades entre gestión de usuarios, validación tributaria y auditoría.

**Cliente-Servidor**: Aplicación móvil React Native como cliente, microservicios FastAPI como servidores.

**Capas**: Separación entre presentación (React Native UI), lógica de negocio (validación y gestión de roles) y persistencia (PostgreSQL).

# Análisis (Atributos de calidad que favorece y desfavorece)

**Favorece:**
- **Latencia**: Comunicación directa HTTP/REST entre móvil y microservicios
- **Usabilidad**: React Native permite UI nativa con desarrollo JavaScript familiar
- **Modificabilidad**: Microservicios permiten cambios independientes en validación tributaria
- **Portabilidad**: React Native despliega en iOS y Android con mismo código

**Desfavorece:**
- **Seguridad**: Aplicación móvil como cliente puede ser menos segura que web
- **Disponibilidad**: Dependencia de conectividad móvil para validación en tiempo real
- **Performance**: Overhead de React Native vs desarrollo nativo puro

---

# Tácticas de Arquitectura asociadas al experimento

**Latencia:**
- Caché local de validaciones recientes con AsyncStorage
- Compresión de payloads HTTP
- Validación asíncrona no bloqueante de UI

**Seguridad:**
- Autenticación basada en JWT con refresh tokens
- Validación de entrada en cliente y servidor
- Comunicación HTTPS obligatoria
- Sanitización de datos de entrada

**Usabilidad:**
- Validación en tiempo real con feedback inmediato
- Mensajes de error claros y específicos
- Indicadores de progreso durante validación
- Formularios con validación incremental

---

# Listado de componentes (Microservicios) involucrados en el experimento

| Microservicio | Propósito y comportamiento esperado | Tecnología Asociada |
| --- | --- | --- |
| **API Gateway** | Enrutamiento de peticiones, autenticación JWT, rate limiting | FastAPI + Nginx |
| **User Management Service** | Gestión de registro, roles y perfiles de usuarios institucionales | FastAPI + SQLAlchemy + PostgreSQL |
| **Tax Validation Service** | Validación de NIT contra lista blanca, consultas a servicios externos | FastAPI + Redis Cache + PostgreSQL |
| **Audit Service** | Registro de eventos de seguridad, trazabilidad de acciones | FastAPI + PostgreSQL |
| **Mobile App** | Interfaz de usuario, formularios de registro, gestión de estado local | React Native + Expo + AsyncStorage |

---

# Listado de conectores involucrados en el experimento

| Conector | Comportamiento deseado en el experimento | Tecnología Asociada |
| --- | --- | --- |
| **HTTP/REST API** | Comunicación entre móvil y API Gateway con latencia <1 segundo | Axios + JSON |
| **Database Connector** | Acceso a datos de usuarios y lista blanca con transacciones ACID | SQLAlchemy + PostgreSQL |
| **Cache Connector** | Almacenamiento temporal de validaciones para mejorar latencia | Redis Client + JSON |
| **Local Storage** | Persistencia local de datos de sesión y caché en móvil | AsyncStorage + React Native |

---

| Tecnología asociada con el experimento (Desarrollo, infraestructura, almacenamiento) | Justificación |
| --- | --- |
| **Lenguajes de programación** - JavaScript/TypeScript, Python | JavaScript para React Native (requerido), Python para microservicios (equipo familiarizado) |
| **Plataforma de despliegue** - Docker + Local/AWS | Contenedores para microservicios, desarrollo local inicial |
| **Bases de datos** - PostgreSQL, Redis | PostgreSQL para datos persistentes ACID, Redis para caché de latencia |
| **Herramientas de análisis** - React Native Flipper (prueba), FastAPI Profiler | Debugging y análisis de performance específicos para el stack |
| **Librerías** - Expo SDK, React Navigation, Axios, SQLAlchemy | Expo acelera desarrollo móvil, otras son estándar para stack elegido |
| **Frameworks de desarrollo** - React Native + Expo, FastAPI | React Native objetivo del experimento, FastAPI para APIs rápidas |

---

# Distribución de actividades por integrante

| Integrante | Tareas a realizar | Esfuerzo Estimado |
| --- | --- | --- |
| **Julio César Forero** | Configuración React Native + Expo, desarrollo componentes UI de registro, integración con APIs | 8 horas |
| **Luz Stella Ochoa** | Desarrollo User Management Service, implementación validación de roles y lista blanca | 8 horas |
| **Wilson Aponte** | Desarrollo Tax Validation Service, implementación de caché Redis, estrategia de testing | 8 horas |
| **Juan Pablo Rodriguez** | Configuración API Gateway, Audit Service, orquestación de microservicios, documentación | 8 horas |
