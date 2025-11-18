/**
 * Interfaces y tipos para el módulo de Rutas de Visitas
 * 
 * Basado en el backend visita-service
 * Endpoint: /api/v1/rutas-visitas
 * 
 * @module core/rutas/interface/ruta
 */

// ========================================
// TIPOS Y ENUMS
// ========================================

/**
 * Niveles de prioridad de una visita
 */
export type PrioridadVisita = 'alta' | 'media' | 'baja';

/**
 * Origen de la ruta
 */
export type OrigenRuta = 'planificada' | 'recalculada' | 'manual';

// ========================================
// INTERFACES PRINCIPALES
// ========================================

/**
 * Visita individual dentro de una ruta
 * Representa un cliente a visitar en un orden específico
 */
export interface Visita {
  visita_id: number;
  cliente_id: number;
  nombre_cliente: string;
  direccion_cliente: string;
  latitud: number | null;
  longitud: number | null;
  hora_inicio_sugerida: string; // Formato HH:MM:SS
  hora_fin_sugerida: string; // Formato HH:MM:SS
  duracion_estimada_minutos: number;
  orden_en_ruta: number;
  prioridad: PrioridadVisita;
  distancia_desde_anterior_km: number | null;
  tiempo_viaje_desde_anterior_min: number | null;
}

/**
 * Ruta de visitas completa con metadata
 * Representa el plan de visitas optimizado para un día específico
 */
export interface RutaDeVisitas {
  ruta_id: number;
  gerente_id: number;
  fecha_ruta: string; // Formato YYYY-MM-DD
  version_ruta: number;
  distancia_total_km: number;
  tiempo_total_minutos: number;
  hora_inicio_sugerida: string; // Formato HH:MM:SS
  hora_fin_sugerida: string; // Formato HH:MM:SS
  origen_ruta: OrigenRuta;
  fecha_calculo: string; // ISO 8601
  activa: boolean;
  visitas: Visita[];
  cantidad_visitas: number;
}

/**
 * Filtros para consultar rutas de visitas
 */
export interface RutasFilter {
  gerente_id: number;
  fecha: string; // Formato YYYY-MM-DD
}

// ========================================
// UTILIDADES
// ========================================

/**
 * Formatea una hora de formato HH:MM:SS a formato legible
 * @param hora Hora en formato HH:MM:SS
 * @param locale Locale para formateo (opcional)
 * @returns Hora formateada (ej: "08:00 AM")
 */
export const formatHora = (hora: string, locale: string = 'es-ES'): string => {
  if (!hora) return 'N/A';
  
  try {
    const [hours, minutes] = hora.split(':');
    const hour = parseInt(hours, 10);
    const minute = minutes || '00';
    
    // Formato 12 horas con AM/PM
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${hour12}:${minute} ${period}`;
  } catch {
    return hora;
  }
};

/**
 * Formatea una fecha de formato YYYY-MM-DD a formato legible
 * @param fecha Fecha en formato YYYY-MM-DD
 * @param locale Locale para formateo (default: 'es-ES')
 * @returns Fecha formateada (ej: "Lunes, 25 de noviembre de 2025" o "Monday, November 25, 2025")
 */
export const formatFechaLarga = (fecha: string, locale: string = 'es-ES'): string => {
  if (!fecha) return 'N/A';
  
  try {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return fecha;
  }
};

/**
 * Formatea una fecha a formato corto
 * @param fecha Fecha en formato YYYY-MM-DD
 * @param locale Locale para formateo (default: 'es-ES')
 * @returns Fecha formateada (ej: "25/11/2025" o "11/25/2025")
 */
export const formatFechaCorta = (fecha: string, locale: string = 'es-ES'): string => {
  if (!fecha) return 'N/A';
  
  try {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return fecha;
  }
};

/**
 * Convierte minutos a formato de horas y minutos
 * @param minutos Total de minutos
 * @param shortFormat Si es true, usa formato corto (h/min), si es false usa palabras completas
 * @returns String formateado (ej: "2h 30min")
 */
export const formatDuracion = (minutos: number, shortFormat: boolean = true): string => {
  if (!minutos || minutos === 0) return shortFormat ? '0min' : '0 minutes';
  
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  
  if (shortFormat) {
    if (horas === 0) return `${mins}min`;
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
  } else {
    // Formato largo (para inglés principalmente)
    const horasText = horas === 1 ? 'hour' : 'hours';
    const minsText = mins === 1 ? 'minute' : 'minutes';
    
    if (horas === 0) return `${mins} ${minsText}`;
    if (mins === 0) return `${horas} ${horasText}`;
    return `${horas} ${horasText} ${mins} ${minsText}`;
  }
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns Fecha de hoy
 */
export const getFechaHoy = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convierte un objeto Date a string YYYY-MM-DD
 * @param date Objeto Date
 * @returns String en formato YYYY-MM-DD
 */
export const dateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convierte un string YYYY-MM-DD a objeto Date
 * @param dateString String en formato YYYY-MM-DD
 * @returns Objeto Date
 */
export const stringToDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

/**
 * Obtiene el color asociado a una prioridad
 * @param prioridad Nivel de prioridad
 * @returns Objeto con colores de fondo y texto
 */
export const getPrioridadColors = (prioridad: PrioridadVisita): { bg: string; text: string } => {
  switch (prioridad) {
    case 'alta':
      return {
        bg: '#FEE2E2', // red-100
        text: '#DC2626', // red-600
      };
    case 'media':
      return {
        bg: '#FEF3C7', // yellow-100
        text: '#D97706', // yellow-600
      };
    case 'baja':
      return {
        bg: '#D1FAE5', // green-100
        text: '#059669', // green-600
      };
    default:
      return {
        bg: '#E5E7EB', // gray-200
        text: '#6B7280', // gray-500
      };
  }
};

