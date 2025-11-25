/**
 * Interfaces y tipos para el módulo de Visitas
 * 
 * Basado en el backend visit-service
 * Endpoints: /api/v1/visits, /visits
 * 
 * @module core/visits/interface/visit
 */

// ========================================
// TIPOS Y ENUMS
// ========================================

/**
 * Tipos de visita disponibles
 */
export type TipoVisita = 
  | 'Seguimiento'
  | 'Presentación'
  | 'Soporte técnico'
  | 'Reunión comercial'
  | 'Capacitación'
  | 'Otro';

// ========================================
// INTERFACES PRINCIPALES
// ========================================

/**
 * Evidencia de una visita (imagen o video)
 */
export interface VisitEvidence {
  id: number;
  filename: string;
  content_type: string;
  size_bytes: number;
  url: string;
}

/**
 * Visita completa como viene del backend
 */
export interface Visit {
  id: number;
  client_id: number;
  account_mgr_id: number;
  visit_datetime: string; // ISO 8601 format
  title?: string | null;
  notes?: string | null;
  contacto_nombre?: string | null;
  tipo_visita?: string | null;
  objetivo_visita?: string | null;
  evidences: VisitEvidence[];
}

/**
 * Datos para crear una nueva visita
 */
export interface CreateVisitData {
  client_id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  contacto_nombre: string;
  tipo_visita: string;
  objetivo_visita: string;
  observaciones?: string; // Se mapea a notes
  title?: string; // Opcional, para compatibilidad
}

/**
 * Respuesta al crear una visita
 */
export interface CreateVisitResponse {
  id: number;
  message: string;
}

/**
 * Respuesta del endpoint GET /api/v1/visits/client/{client_id}
 */
export interface VisitsListResponse {
  items: Visit[];
  total: number;
}

/**
 * Respuesta del endpoint GET /api/v1/visits/{visit_id}
 */
export interface VisitDetailResponse extends Visit {}

/**
 * Respuesta al subir evidencia
 */
export interface UploadEvidenceResponse {
  items: VisitEvidence[];
  count: number;
}

// ========================================
// UTILIDADES
// ========================================

/**
 * Formatea la fecha y hora de la visita para mostrar en la UI
 */
export const formatVisitDateTime = (isoString: string, locale: string = 'es'): string => {
  try {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString(locale === 'es' ? 'es-ES' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateStr} ${timeStr}`;
  } catch {
    return isoString;
  }
};

/**
 * Formatea solo la fecha de la visita
 */
export const formatVisitDate = (isoString: string, locale: string = 'es'): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
};

/**
 * Formatea solo la hora de la visita
 */
export const formatVisitTime = (isoString: string, locale: string = 'es'): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString(locale === 'es' ? 'es-ES' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};

/**
 * Determina si una evidencia es una imagen
 */
export const isImageEvidence = (evidence: VisitEvidence): boolean => {
  return evidence.content_type.startsWith('image/');
};

/**
 * Determina si una evidencia es un video
 */
export const isVideoEvidence = (evidence: VisitEvidence): boolean => {
  return evidence.content_type.startsWith('video/');
};

/**
 * Formatea el tamaño del archivo en bytes a formato legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

