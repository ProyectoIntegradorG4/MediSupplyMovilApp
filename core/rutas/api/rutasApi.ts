/**
 * API Client para Rutas de Visitas
 * 
 * Endpoints del visita-service a través del API Gateway (NGINX puerto 80)
 * Rutas:
 * - /api/v1/rutas-visitas → visita-service
 * 
 * @module core/rutas/api/rutasApi
 */

import { CONFIG } from '@/constants/config';
import axios from 'axios';
import { RutaDeVisitas, RutasFilter } from '../interface/ruta';

/**
 * Cliente Axios configurado para peticiones de rutas de visitas
 * Base URL: API Gateway (puerto 80)
 */
const rutasApi = axios.create({
  baseURL: CONFIG.API.GATEWAY_URL,
  timeout: CONFIG.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para logging en modo desarrollo
 */
if (CONFIG.DEBUG) {
  rutasApi.interceptors.request.use((config) => {
    console.log(`🌐 [RUTAS API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.params) {
      console.log(`   Params:`, config.params);
    }
    return config;
  });

  rutasApi.interceptors.response.use(
    (response) => {
      console.log(`✅ [RUTAS API] ${response.status} ${response.config.url}`);
      if (response.data) {
        console.log(`   Data:`, {
          ruta_id: response.data.ruta_id,
          cantidad_visitas: response.data.cantidad_visitas
        });
      }
      return response;
    },
    (error) => {
      console.error(`❌ [RUTAS API] ${error.response?.status || 'ERROR'} ${error.config?.url}`);
      console.error(`   Error:`, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

// ========================================
// FUNCIONES DE API
// ========================================

/**
 * Obtiene la ruta de visitas para un gerente en una fecha específica
 * 
 * Endpoint: GET /api/v1/rutas-visitas?gerente_id={id}&fecha={fecha}
 * 
 * @param filters Filtros con gerente_id y fecha
 * @returns Ruta de visitas optimizada con listado de visitas
 * @throws Error si falla la petición
 * 
 * Ejemplos:
 * - getRutasVisitas({ gerente_id: 1, fecha: '2025-11-25' })
 */
export const getRutasVisitas = async (filters: RutasFilter): Promise<RutaDeVisitas> => {
  const { data } = await rutasApi.get<RutaDeVisitas>(
    '/api/v1/rutas-visitas',
    {
      params: {
        gerente_id: filters.gerente_id,
        fecha: filters.fecha
      }
    }
  );
  return data;
};

// ========================================
// UTILIDADES DE MANEJO DE ERRORES
// ========================================

/**
 * Formatea errores de la API de rutas de visitas
 * 
 * @param error Error capturado de axios
 * @returns Mensaje de error legible para el usuario
 */
export const formatRutasError = (error: any): string => {
  if (error.response) {
    // Error de respuesta del servidor
    const status = error.response.status;
    const detail = error.response.data?.detail;
    
    switch (status) {
      case 404:
        return detail || 'No se encontró ruta para la fecha especificada';
      case 400:
        return detail || 'Parámetros inválidos para consultar ruta';
      case 500:
        return 'Error en el servidor. Intente más tarde.';
      default:
        return detail || 'Error al obtener ruta de visitas';
    }
  } else if (error.request) {
    // Request hecho pero sin respuesta
    return 'No se pudo conectar al servidor. Verifique su conexión.';
  } else {
    // Error al configurar el request
    return error.message || 'Error desconocido';
  }
};

export { rutasApi };

