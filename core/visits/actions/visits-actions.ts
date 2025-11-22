/**
 * Acciones de Visitas
 * 
 * Funciones para gestionar visitas a clientes
 * Todas las peticiones van a través del API Gateway
 * 
 * @module core/visits/actions/visits-actions
 */

import {
  createVisit as createVisitApi,
  getVisitById as getVisitByIdApi,
  getVisitsByClient as getVisitsByClientApi,
  uploadEvidence as uploadEvidenceApi,
  formatVisitsError,
} from '../api/visitsApi';
import {
  CreateVisitData,
  CreateVisitResponse,
  Visit,
  VisitsListResponse,
  UploadEvidenceResponse,
} from '../interface/visit';

/**
 * Crea una nueva visita a un cliente
 * 
 * @param data Datos de la visita
 * @returns Respuesta con el ID de la visita creada
 */
export const createVisit = async (data: CreateVisitData): Promise<CreateVisitResponse> => {
  try {
    console.log('📝 [Actions] Creando visita:', {
      client_id: data.client_id,
      date: data.date,
      time: data.time,
      tipo_visita: data.tipo_visita,
    });
    const response = await createVisitApi(data);
    console.log(`✅ [Actions] Visita creada exitosamente: ID ${response.id}`);
    return response;
  } catch (error) {
    console.error('❌ [Actions] Error al crear visita:', error);
    const errorMessage = formatVisitsError(error);
    throw errorMessage;
  }
};

/**
 * Obtiene el detalle completo de una visita
 * 
 * @param visitId ID de la visita
 * @returns Detalle completo de la visita con evidencias
 */
export const fetchVisitById = async (visitId: number): Promise<Visit> => {
  try {
    console.log(`📋 [Actions] Obteniendo visita ${visitId}...`);
    const visit = await getVisitByIdApi(visitId);
    console.log(`✅ [Actions] Visita obtenida: ${visit.id} con ${visit.evidences.length} evidencias`);
    return visit;
  } catch (error) {
    console.error(`❌ [Actions] Error al obtener visita ${visitId}:`, error);
    const errorMessage = formatVisitsError(error);
    throw errorMessage;
  }
};

/**
 * Obtiene la lista de visitas de un cliente
 * 
 * @param clientId ID del cliente
 * @param limit Número máximo de resultados (default: 50)
 * @param offset Número de resultados a omitir (default: 0)
 * @returns Lista de visitas del cliente
 */
export const fetchVisitsByClient = async (
  clientId: number,
  limit: number = 50,
  offset: number = 0
): Promise<VisitsListResponse> => {
  try {
    console.log(`📋 [Actions] Obteniendo visitas del cliente ${clientId}...`);
    const data = await getVisitsByClientApi(clientId, limit, offset);
    console.log(`✅ [Actions] ${data.total} visitas obtenidas para el cliente ${clientId}`);
    return data;
  } catch (error) {
    console.error(`❌ [Actions] Error al obtener visitas del cliente ${clientId}:`, error);
    const errorMessage = formatVisitsError(error);
    throw errorMessage;
  }
};

/**
 * Sube una evidencia (imagen o video) a una visita
 * 
 * @param visitId ID de la visita
 * @param file Archivo a subir (con URI, type y name)
 * @param comment Comentario/recomendación asociado a la evidencia
 * @returns Respuesta con los detalles de la evidencia subida
 */
export const uploadVisitEvidence = async (
  visitId: number,
  file: { uri: string; type: string; name: string },
  comment?: string
): Promise<UploadEvidenceResponse> => {
  try {
    console.log(`📤 [Actions] Subiendo evidencia para visita ${visitId}...`);
    const response = await uploadEvidenceApi(visitId, file, comment);
    console.log(`✅ [Actions] Evidencia subida exitosamente: ${response.count} archivo(s)`);
    return response;
  } catch (error) {
    console.error(`❌ [Actions] Error al subir evidencia para visita ${visitId}:`, error);
    const errorMessage = formatVisitsError(error);
    throw errorMessage;
  }
};

