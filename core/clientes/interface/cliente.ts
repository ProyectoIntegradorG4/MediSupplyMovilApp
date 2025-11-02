/**
 * Interfaces y tipos para el módulo de Clientes
 * 
 * Basado en el backend cliente-service
 * Endpoint: /api/v1/clientes
 * 
 * @module core/clientes/interface/cliente
 */

// ========================================
// TIPOS Y ENUMS
// ========================================

/**
 * Tipos de institución según el backend
 * Debe coincidir con TipoInstitucion del backend
 */
export type TipoInstitucion = 
  | 'Hospital' 
  | 'Clínica' 
  | 'IPS' 
  | 'EPS' 
  | 'Laboratorio Clínico' 
  | 'Centro de Salud';

/**
 * Países disponibles en el sistema
 */
export type Pais = 'Colombia' | 'Peru' | 'Mexico' | 'Ecuador';

// ========================================
// INTERFACES PRINCIPALES
// ========================================

/**
 * Cliente institucional como viene del backend
 * Coincide con ClienteResponse del backend
 */
export interface Cliente {
  cliente_id: number;
  nit: string;
  nombre_comercial: string;
  razon_social: string;
  tipo_institucion: TipoInstitucion;
  pais: Pais;
  departamento?: string | null;
  ciudad?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  contacto_principal?: string | null;
  cargo_contacto?: string | null;
  especialidad_medica?: string | null;
  activo: boolean;
  fecha_registro?: string;
  fecha_actualizacion?: string;
}

/**
 * Respuesta del endpoint GET /api/v1/clientes/mis-clientes
 */
export interface ClientesListResponse {
  total: number;
  page: number;
  limit: number;
  clientes: Cliente[];
}

/**
 * Respuesta del endpoint GET /api/v1/clientes/tipos-institucion
 */
export interface TiposInstitucionResponse {
  tipos: TipoInstitucion[];
}

/**
 * Filtros para consultar clientes
 * Todos los parámetros son opcionales
 */
export interface ClientesFilter {
  gerente_id?: number;
  pais?: Pais;
  tipo_institucion?: TipoInstitucion;
  search?: string;
  page?: number;
  limit?: number;
  activo?: boolean;
}

// ========================================
// UTILIDADES
// ========================================

/**
 * Mapea un cliente del backend al formato del ClientCard legacy
 * Para mantener compatibilidad con el componente existente
 */
export const mapClienteToCard = (cliente: Cliente) => ({
  id: cliente.cliente_id.toString(),
  name: cliente.nombre_comercial,
  address: cliente.direccion || `${cliente.ciudad || ''}, ${cliente.pais}`.trim(),
  phone: cliente.telefono || 'Sin teléfono',
  doctor: cliente.contacto_principal || 'Sin contacto',
  lastVisit: cliente.fecha_actualizacion 
    ? new Date(cliente.fecha_actualizacion).toLocaleDateString('es-ES') 
    : 'Sin visitas',
  type: cliente.tipo_institucion as any, // Compatibilidad con el tipo actual
});

/**
 * Formatea la fecha para mostrar en la UI
 */
export const formatFecha = (fecha?: string): string => {
  if (!fecha) return 'N/A';
  
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return fecha;
  }
};

