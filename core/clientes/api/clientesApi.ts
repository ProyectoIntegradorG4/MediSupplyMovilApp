/**
 * API Client para Clientes
 * 
 * Endpoints del cliente-service a través del API Gateway (NGINX puerto 80)
 * Rutas:
 * - /api/v1/clientes/mis-clientes → cliente-service:8013
 * - /api/v1/clientes/{id} → cliente-service:8013
 * - /api/v1/clientes/tipos-institucion → cliente-service:8013
 * 
 * @module core/clientes/api/clientesApi
 */

import { CONFIG } from '@/constants/config';
import axios from 'axios';
import { 
  Cliente, 
  ClientesListResponse, 
  ClientesFilter, 
  TiposInstitucionResponse 
} from '../interface/cliente';

/**
 * Cliente Axios configurado para peticiones de clientes
 * Base URL: API Gateway (puerto 80)
 * 
 * Nota: El backend cliente-service NO requiere autenticación en modo desarrollo
 */
const clientesApi = axios.create({
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
  clientesApi.interceptors.request.use((config) => {
    console.log(`🌐 [CLIENTES API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.params) {
      console.log(`   Params:`, config.params);
    }
    return config;
  });

  clientesApi.interceptors.response.use(
    (response) => {
      console.log(`✅ [CLIENTES API] ${response.status} ${response.config.url}`);
      if (response.data) {
        console.log(`   Data:`, {
          total: response.data.total,
          count: response.data.clientes?.length || 'N/A'
        });
      }
      return response;
    },
    (error) => {
      console.error(`❌ [CLIENTES API] ${error.response?.status || 'ERROR'} ${error.config?.url}`);
      console.error(`   Error:`, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

// ========================================
// FUNCIONES DE API
// ========================================

/**
 * Obtiene la lista de clientes con filtros opcionales
 * 
 * Endpoint: GET /api/v1/clientes/mis-clientes
 * 
 * @param filters Filtros opcionales (gerente_id, pais, tipo_institucion, search, page, limit, activo)
 * @returns Lista paginada de clientes
 * @throws Error si falla la petición
 * 
 * Ejemplos:
 * - getClientes() → Todos los clientes
 * - getClientes({ gerente_id: 1 }) → Clientes del gerente 1
 * - getClientes({ pais: 'Colombia' }) → Clientes de Colombia
 * - getClientes({ tipo_institucion: 'Hospital' }) → Solo hospitales
 * - getClientes({ search: 'Bogotá' }) → Búsqueda en nombre/ciudad
 */
export const getClientes = async (filters?: ClientesFilter): Promise<ClientesListResponse> => {
  const { data } = await clientesApi.get<ClientesListResponse>(
    '/api/v1/clientes/mis-clientes',
    {
      params: filters
    }
  );
  return data;
};

/**
 * Obtiene el detalle completo de un cliente específico
 * 
 * Endpoint: GET /api/v1/clientes/{id}
 * 
 * @param clienteId ID del cliente
 * @returns Información completa del cliente
 * @throws Error si el cliente no existe o no se tiene acceso
 */
export const getClienteById = async (clienteId: number): Promise<Cliente> => {
  const { data } = await clientesApi.get<Cliente>(`/api/v1/clientes/${clienteId}`);
  return data;
};

/**
 * Obtiene los tipos de institución disponibles
 * 
 * Endpoint: GET /api/v1/clientes/tipos-institucion
 * 
 * @returns Array de tipos de institución
 * 
 * Útil para poblar filtros y dropdowns
 */
export const getTiposInstitucion = async (): Promise<TiposInstitucionResponse> => {
  const { data } = await clientesApi.get<TiposInstitucionResponse>(
    '/api/v1/clientes/tipos-institucion'
  );
  return data;
};

/**
 * Obtiene las sedes (clientes) asociadas a un NIT específico
 * 
 * Endpoint: GET /api/v1/clientes/por-nit?nit=...
 * 
 * @param nit NIT del cual se desean obtener las sedes
 * @returns Objeto con array de clientes
 */
export const getClientesPorNit = async (nit: string): Promise<{ clientes: Cliente[] }> => {
  // Intentar con varias variantes del NIT sin modificar el valor almacenado
  const candidates = Array.from(new Set([
    String(nit),
    String(nit).trim(),
    String(nit).replace(/\s+/g, ''),           // sin espacios
    String(nit).replace(/[^0-9A-Za-z-]/g, ''), // limpiar chars raros, mantener guiones
    String(nit).includes('-') ? String(nit).split('-')[0] : String(nit), // base sin DV si aplica
  ]));

  let lastError: any = null;

  for (const candidate of candidates) {
    try {
      const { data } = await clientesApi.get<{ clientes: Cliente[] }>(
        '/api/v1/clientes/por-nit',
        { params: { nit: candidate } }
      );
      return data;
    } catch (error: any) {
      lastError = error;
      // Si es 422/400, intentar la siguiente variante
      const status = error?.response?.status;
      if (status === 400 || status === 422) {
        continue;
      }
      // Otros errores: devolver fallo
      throw error;
    }
  }

  // Si todas fallan por validación, retornar vacío para permitir fallback por búsqueda
  if (lastError?.response?.status === 400 || lastError?.response?.status === 422) {
    return { clientes: [] };
  }

  // Devolver el último error si fue distinto a validación
  throw lastError || new Error('Error desconocido al consultar clientes por NIT');
};

/**
 * Health check del servicio de clientes
 * 
 * Endpoint: GET /health/cliente
 * 
 * @returns Estado del servicio
 */
export const healthCheck = async (): Promise<{ status: string; service: string }> => {
  const { data } = await clientesApi.get('/health/cliente');
  return data;
};

// ========================================
// UTILIDADES DE MANEJO DE ERRORES
// ========================================

/**
 * Formatea errores de la API de clientes
 * 
 * @param error Error capturado de axios
 * @returns Mensaje de error legible para el usuario
 */
export const formatClientesError = (error: any): string => {
  if (error.response) {
    // Error de respuesta del servidor
    const status = error.response.status;
    const detail = error.response.data?.detail;
    
    switch (status) {
      case 404:
        return detail || 'Cliente no encontrado';
      case 500:
        return 'Error en el servidor. Intente más tarde.';
      default:
        return detail || 'Error al obtener clientes';
    }
  } else if (error.request) {
    // Request hecho pero sin respuesta
    return 'No se pudo conectar al servidor. Verifique su conexión.';
  } else {
    // Error al configurar el request
    return error.message || 'Error desconocido';
  }
};

export { clientesApi };

