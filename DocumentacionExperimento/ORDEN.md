# Plan de Actividades - Experimento Registro Clientes Institucionales

## Información General
- **Proyecto**: MediSupply G4 - Experimento React Native
- **Duración**: 8-21 de septiembre de 2025 (2 semanas)
- **Esfuerzo Total**: 32 horas hombre (16 horas por integrante)
- **Equipo**: 2 personas (Julio César Forero y Wilson Aponte)
- **Objetivo**: Validar React Native para registro de clientes institucionales con latencia <1 segundo

---

## Plan de Actividades Detallado

| Tarea Principal | Subtareas | Orden | Responsable | Recursos | Inicio | Fin | Notas |
|-----------------|-----------|-------|-------------|----------|--------|-----|-------|
| **1. Configuración del Entorno de Desarrollo** | - Instalar React Native + Expo SDK<br>- Configurar Android Studio/emuladores<br>- Configurar Docker para microservicios<br>- Crear repositorio del proyecto | 1 | Julio César Forero | Node.js 18+, Expo CLI, Android Studio, Docker Desktop | 08/09/2025 | 09/09/2025 | Crítico: Sin experiencia previa en React Native |
| **2. Diseño de APIs y Contratos** | - Definir endpoints REST para registro<br>- Especificar schemas de request/response<br>- Documentar códigos de error HTTP<br>- Crear colección Postman | 2 | Wilson Aponte | Postman, OpenAPI/Swagger, Confluence | 08/09/2025 | 09/09/2025 | Depende de revisión de documentación |
| **3. Implementación Backend - User Management** | - Crear microservicio FastAPI<br>- Implementar endpoints de registro<br>- Configurar PostgreSQL para usuarios<br>- Implementar validación de roles | 3 | Wilson Aponte | FastAPI, SQLAlchemy, PostgreSQL, Docker | 10/09/2025 | 12/09/2025 | Base para validación de NIT |
| **4. Implementación Backend - Tax Validation** | - Crear microservicio de validación NIT<br>- Implementar caché Redis<br>- Cargar lista blanca precargada<br>- Optimizar consultas para latencia | 4 | Wilson Aponte | FastAPI, Redis, PostgreSQL, Docker | 10/09/2025 | 12/09/2025 | Crítico para latencia <1 segundo |
| **5. Implementación Backend - Audit Service** | - Crear microservicio de auditoría<br>- Implementar logging de eventos<br>- Configurar trazabilidad de sesiones<br>- Crear reportes de seguridad | 5 | Wilson Aponte | FastAPI, PostgreSQL, Docker | 10/09/2025 | 12/09/2025 | Paralelo con otros microservicios |
| **6. Configuración API Gateway** | - Implementar Nginx como gateway<br>- Configurar rate limiting<br>- Implementar autenticación JWT<br>- Configurar CORS para React Native | 6 | Wilson Aponte | Nginx, Docker, JWT libraries | 13/09/2025 | 13/09/2025 | Orquestación de microservicios |
| **7. Desarrollo React Native - UI Base** | - Crear estructura de navegación<br>- Implementar pantalla de registro<br>- Configurar AsyncStorage<br>- Implementar manejo de estado | 7 | Julio César Forero | React Native, Expo, React Navigation, AsyncStorage | 13/09/2025 | 15/09/2025 | En paralelo con integración backend |
| **8. Desarrollo React Native - Formulario** | - Implementar formulario de registro<br>- Validación en tiempo real<br>- Manejo de errores específicos<br>- Indicadores de progreso | 8 | Julio César Forero | React Hook Form, React Native Paper | 13/09/2025 | 15/09/2025 | UX crítica para usabilidad |
| **9. Integración Frontend-Backend** | - Conectar React Native con APIs<br>- Implementar autenticación JWT<br>- Manejo de respuestas HTTP<br>- Implementar confirmación en pantalla | 9 | Julio César Forero | Axios, JWT libraries, React Native | 16/09/2025 | 17/09/2025 | Punto crítico de integración |
| **10. Pruebas Unitarias** | - Pruebas de componentes React Native<br>- Pruebas de microservicios FastAPI<br>- Pruebas de APIs REST<br>- Pruebas de base de datos | 10 | Wilson Aponte | Jest, Pytest, Postman | 16/09/2025 | 17/09/2025 | Cobertura >80% requerida |
| **11. Pruebas de Integración** | - Flujo completo app → API Gateway → microservicios<br>- Validación de caché Redis<br>- Pruebas de autenticación JWT<br>- Pruebas de auditoría | 11 | Wilson Aponte | Postman, Docker Compose, Test containers | 18/09/2025 | 18/09/2025 | Validar latencia <1 segundo |
| **12. Pruebas de Usabilidad** | - Pruebas en dispositivos reales Android/iOS<br>- Medición de tiempo completar formulario<br>- Validación de mensajes de error<br>- Pruebas de accesibilidad | 12 | Julio César Forero | Dispositivos móviles, Expo Go | 18/09/2025 | 19/09/2025 | Objetivo: <30 segundos completar |
| **13. Pruebas de Performance** | - Pruebas de carga (10 usuarios simultáneos)<br>- Pruebas de estrés (50 usuarios)<br>- Medición de latencia end-to-end<br>- Análisis de uso de memoria | 13 | Wilson Aponte | Artillery, JMeter, React Native Flipper | 19/09/2025 | 19/09/2025 | Validar criterios de latencia |
| **14. Documentación Técnica** | - Completar README del proyecto<br>- Documentar APIs con OpenAPI<br>- Crear guía de despliegue<br>- Documentar métricas de monitoreo | 14 | Wilson Aponte | Markdown, OpenAPI, Confluence | 20/09/2025 | 20/09/2025 | Entregable final |
| **15. Análisis de Resultados** | - Evaluar métricas de latencia<br>- Analizar criterios de éxito<br>- Documentar lecciones aprendidas<br>- Preparar recomendaciones | 15 | Ambos | Dashboards, logs, métricas | 20/09/2025 | 21/09/2025 | Validar hipótesis del experimento |
| **16. Entrega Final** | - Consolidar entregables<br>- Subir código a repositorio<br>- Crear presentación de resultados<br>- Completar checklist de entrega | 16 | Ambos | GitHub, Confluence, PowerPoint | 21/09/2025 | 21/09/2025 | Listo para Jira |

---

## Distribución de Responsabilidades por Integrante

### Julio César Forero (16 horas)
- Configuración React Native + Expo
- Desarrollo componentes UI de registro
- Desarrollo formulario de registro
- Integración con APIs
- Pruebas de usabilidad
- Análisis de resultados (colaborativo)

### Wilson Aponte (16 horas)
- Diseño de APIs y contratos
- Desarrollo User Management Service
- Desarrollo Tax Validation Service
- Implementación de caché Redis
- Desarrollo Audit Service
- Configuración API Gateway
- Estrategia de testing
- Pruebas unitarias
- Pruebas de integración
- Pruebas de performance
- Documentación técnica
- Análisis de resultados (colaborativo)

---

## Criterios de Éxito del Experimento

### Técnicos
- **Latencia**: Registro completo en <1 segundo (p95)
- **Funcionalidad**: 100% criterios de aceptación HU-MOV-007
- **Usabilidad**: Formulario completable en <30 segundos
- **Seguridad**: 100% validaciones NIT correctas

### Arquitectónicos
- **Microservicios**: Comunicación eficiente entre servicios
- **React Native**: Viabilidad técnica para el dominio
- **Integración**: Flujo completo app → backend funcional

### Aprendizaje
- **Equipo**: Capacidad de desarrollar en React Native
- **Documentación**: Conocimiento transferible
- **Recomendaciones**: Decisiones arquitectónicas validadas

---

## Riesgos Críticos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Sin experiencia React Native** | Alta | Alto | Configuración temprana, tutoriales, pair programming |
| **Solo 2 personas para 32 horas** | Alta | Alto | Trabajo en paralelo, priorización de tareas críticas |
| **Wilson sobrecargado con backend** | Media | Alto | Julio César puede apoyar en APIs simples, documentación clara |
| **Latencia >1 segundo** | Media | Alto | Optimización caché Redis, payloads mínimos |
| **Problemas integración móvil-backend** | Media | Alto | Pruebas tempranas, APIs bien documentadas |
| **Dispositivos móviles no disponibles** | Baja | Medio | Emuladores Android, Expo Go como backup |

---

## Recursos Necesarios

### Software
- React Native 0.72 + Expo SDK
- Node.js 18+, npm/yarn
- Android Studio + emuladores
- Docker Desktop
- FastAPI, PostgreSQL, Redis
- Visual Studio Code + extensiones

### Hardware
- Dispositivos móviles Android/iOS (3-5 dispositivos)
- Máquinas desarrollo 16GB RAM mínimo
- Conexión estable a internet

### Documentación
- ExperimentoRegistroClientesInstitucionales.md
- VistasArquitecturaRegistroClientes.md
- Especificaciones de APIs
- Criterios de aceptación HU-MOV-007

---

## Notas Importantes para Jira

1. **Dependencias**: Las tareas 3-5 (microservicios) pueden ejecutarse en paralelo
2. **Hitos críticos**: Integración frontend-backend (tarea 9) es punto de no retorno
3. **Validación continua**: Ejecutar pruebas después de cada tarea de desarrollo
4. **Comunicación**: Daily standups para sincronizar avances entre Julio César y Wilson
5. **Trabajo en paralelo**: Julio César (React Native) y Wilson (Backend) pueden trabajar simultáneamente
6. **Sobrecarga Wilson**: Considerar que Wilson maneja todo el backend - Julio César puede apoyar en documentación
7. **Rollback**: Mantener versión web de registro como backup
8. **Métricas**: Registrar latencia, errores y satisfacción de usuario en tiempo real
9. **Priorización**: Si hay retrasos, priorizar funcionalidad core sobre optimizaciones

---

*Documento generado para planificación en Jira - Experimento React Native MediSupply G4*
