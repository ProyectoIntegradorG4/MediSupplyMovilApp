/**
 * API Client para Visitas
 * 
 * Endpoints del visit-service a través del API Gateway (NGINX puerto 80)
 * Rutas:
 * - POST /api/v1/visits → visit-service:8011
 * - POST /visits/{id}/evidence → visit-service:8011
 * - GET /api/v1/visits/{id} → visit-service:8011
 * - GET /api/v1/visits/client/{client_id} → visit-service:8011
 * 
 * @module core/visits/api/visitsApi
 */

import { CONFIG } from '@/constants/config';
import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import axios, { AxiosError } from 'axios';
import {
  CreateVisitData,
  CreateVisitResponse,
  Visit,
  VisitDetailResponse,
  VisitsListResponse,
  UploadEvidenceResponse,
} from '../interface/visit';

/**
 * Cliente Axios configurado para peticiones de visitas
 * Base URL: API Gateway (puerto 80)
 */
const visitsApi = axios.create({
  baseURL: CONFIG.API.GATEWAY_URL,
  timeout: CONFIG.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar headers de autenticación y RBAC
 * IMPORTANTE: Este debe ser el PRIMER interceptor para que los headers estén disponibles
 */
visitsApi.interceptors.request.use(async (config) => {
  const token = await SecureStorageAdapter.getItem('token');
  const userDataString = await SecureStorageAdapter.getItem('user');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Agregar headers de RBAC (X-User-Id, X-User-Role)
  if (userDataString) {
    try {
      const user = JSON.parse(userDataString);
      if (user.id) {
        config.headers['X-User-Id'] = user.id.toString();
      }
      if (user.roles && user.roles.length > 0) {
        // Buscar el rol gerente_cuenta o usar el primero
        const gerenteRole = user.roles.find((r: string) => r.includes('gerente_cuenta')) || user.roles[0];
        config.headers['X-User-Role'] = gerenteRole;
      } else {
        console.warn('⚠️ [VISITS API] Usuario sin roles asignados');
      }
    } catch (e) {
      console.warn('⚠️ [VISITS API] Error parseando usuario para headers RBAC:', e);
    }
  } else {
    console.warn('⚠️ [VISITS API] No hay datos de usuario en storage para headers RBAC');
  }

  // Si es FormData, eliminar Content-Type COMPLETAMENTE para que axios lo establezca automáticamente
  // En React Native, FormData necesita que axios establezca el Content-Type automáticamente con boundary
  if (config.data instanceof FormData) {
    // Eliminar Content-Type de todas las formas posibles
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
      // También eliminar del objeto de headers por defecto si existe
      if (config.headers.common) {
        delete config.headers.common['Content-Type'];
      }
    }
  }

  return config;
});

/**
 * Interceptor para logging y verificación final de FormData
 * Este interceptor se ejecuta DESPUÉS del interceptor de headers
 */
visitsApi.interceptors.request.use((config) => {
  // Si es FormData, verificar y eliminar Content-Type una vez más
  if (config.data instanceof FormData) {
    // Eliminar Content-Type una vez más por si acaso axios lo agregó
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
    
    // Logging detallado
    console.log(`🌐 [VISITS API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log(`   FormData detected - Content-Type will be set automatically`);
    console.log(`   Headers:`, {
      Authorization: config.headers.Authorization ? 'Bearer ***' : 'missing',
      'X-User-Id': config.headers['X-User-Id'] || 'missing',
      'X-User-Role': config.headers['X-User-Role'] || 'missing',
      'Content-Type': config.headers['Content-Type'] || 'will be set by axios',
    });
  } else if (CONFIG.DEBUG) {
    console.log(`🌐 [VISITS API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.params) {
      console.log(`   Params:`, config.params);
    }
    console.log(`   Headers:`, {
      Authorization: config.headers.Authorization ? 'Bearer ***' : 'missing',
      'X-User-Id': config.headers['X-User-Id'] || 'missing',
      'X-User-Role': config.headers['X-User-Role'] || 'missing',
    });
  }
  return config;
});

/**
 * Interceptor para logging de respuestas (siempre activo para uploads)
 */
visitsApi.interceptors.response.use(
  (response) => {
    if (response.config.data instanceof FormData) {
      console.log(`✅ [VISITS API] Upload success: ${response.status} ${response.config.url}`);
    } else if (CONFIG.DEBUG) {
      console.log(`✅ [VISITS API] ${response.status} ${response.config.url}`);
      if (response.data) {
        console.log(`   Data:`, {
          id: response.data.id || response.data.items?.length || 'N/A',
          total: response.data.total || 'N/A'
        });
      }
    }
    return response;
  },
  (error) => {
    // Log siempre para errores de uploads
    if (error.config?.data instanceof FormData || !error.response) {
      console.error(`❌ [VISITS API] Upload error: ${error.response?.status || 'NETWORK ERROR'} ${error.config?.url}`);
      console.error(`   Error Response:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      console.error(`   Request Headers:`, {
        Authorization: error.config?.headers?.Authorization ? 'Bearer ***' : 'missing',
        'X-User-Id': error.config?.headers?.['X-User-Id'] || 'missing',
        'X-User-Role': error.config?.headers?.['X-User-Role'] || 'missing',
        'Content-Type': error.config?.headers?.['Content-Type'] || 'missing',
      });
      console.error(`   Error Message:`, error.message);
      console.error(`   Error Code:`, (error as any).code);
    } else if (CONFIG.DEBUG) {
      console.error(`❌ [VISITS API] ${error.response?.status || 'ERROR'} ${error.config?.url}`);
      console.error(`   Error Response:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      console.error(`   Request Headers:`, error.config?.headers);
      console.error(`   Error Message:`, error.message);
    }
    return Promise.reject(error);
  }
);

// ========================================
// FUNCIONES DE API
// ========================================

/**
 * Crea una nueva visita
 * 
 * @param data Datos de la visita
 * @returns Respuesta con el ID de la visita creada
 */
export const createVisit = async (data: CreateVisitData): Promise<CreateVisitResponse> => {
  try {
    // Construir el payload según el formato esperado por el backend
    const payload: any = {
      client_id: data.client_id,
      date: data.date,
      time: data.time,
      contacto_nombre: data.contacto_nombre,
      tipo_visita: data.tipo_visita,
      objetivo_visita: data.objetivo_visita,
    };

    // Agregar campos opcionales
    if (data.observaciones) {
      payload.notes = data.observaciones;
    }
    if (data.title) {
      payload.title = data.title;
    }

    // Usar /visits según nginx.conf (ruta sin /api/v1)
    const response = await visitsApi.post<CreateVisitResponse>('/visits', payload);
    return response.data;
  } catch (error) {
    throw formatVisitsError(error);
  }
};

/**
 * Obtiene el detalle completo de una visita
 * 
 * @param visitId ID de la visita
 * @returns Detalle completo de la visita con evidencias
 */
export const getVisitById = async (visitId: number): Promise<VisitDetailResponse> => {
  try {
    const response = await visitsApi.get<VisitDetailResponse>(`/api/v1/visits/${visitId}`);
    return response.data;
  } catch (error) {
    throw formatVisitsError(error);
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
export const getVisitsByClient = async (
  clientId: number,
  limit: number = 50,
  offset: number = 0
): Promise<VisitsListResponse> => {
  try {
    const response = await visitsApi.get<VisitsListResponse>(
      `/api/v1/visits/client/${clientId}`,
      {
        params: { limit, offset },
      }
    );
    return response.data;
  } catch (error) {
    throw formatVisitsError(error);
  }
};

/**
 * Regenera la URL pre-firmada de una evidencia
 * Útil cuando la URL expira después de 24 horas
 * 
 * @param visitId ID de la visita
 * @param evidenceId ID de la evidencia
 * @returns Nueva URL pre-firmada con 24 horas de validez
 */
export const regenerateEvidenceUrl = async (
  visitId: number,
  evidenceId: number
): Promise<{ id: number; url: string; expires_in_seconds: number }> => {
  try {
    const response = await visitsApi.get(
      `/api/v1/visits/${visitId}/evidence/${evidenceId}/url`
    );
    return response.data;
  } catch (error) {
    throw formatVisitsError(error);
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
export const uploadEvidence = async (
  visitId: number,
  file: { uri: string; type: string; name: string },
  comment?: string
): Promise<UploadEvidenceResponse> => {
  try {
    // Validar que el URI existe
    if (!file.uri) {
      throw new Error('URI del archivo no válido');
    }

    const formData = new FormData();

    // Determinar el tipo de archivo y agregarlo al FormData
    // En React Native, FormData necesita un objeto con uri, type y name
    const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : 'file';
    
    // FormData para React Native - el objeto debe tener esta estructura exacta
    // Para Android, el URI debe ser file:// o content://
    // Para iOS, puede ser ph:// o file://
    const fileName = file.name || `file_${Date.now()}.${file.type.startsWith('image/') ? 'jpg' : 'mp4'}`;
    
    // Asegurar que el tipo MIME sea correcto
    let mimeType = file.type;
    if (!mimeType || mimeType === 'image' || mimeType === 'video') {
      // Si el tipo no es un MIME válido, inferirlo del nombre del archivo
      if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (fileName.toLowerCase().endsWith('.png')) {
        mimeType = 'image/png';
      } else if (fileName.toLowerCase().endsWith('.mp4')) {
        mimeType = 'video/mp4';
      } else if (fileType === 'image') {
        mimeType = 'image/jpeg'; // Default para imágenes
      } else if (fileType === 'video') {
        mimeType = 'video/mp4'; // Default para videos
      } else {
        mimeType = 'application/octet-stream';
      }
    }
    
    // FormData para React Native - estructura exacta requerida
    // IMPORTANTE: En React Native, FormData.append() necesita un objeto con esta estructura exacta:
    // { uri: string, type: string, name: string }
    // El tipo debe ser un MIME type válido (ej: 'image/jpeg', 'video/mp4')
    const fileData = {
      uri: file.uri,
      type: mimeType, // MIME type válido (ej: 'image/jpeg')
      name: fileName,
    };

    console.log(`📤 [VISITS API] FormData file data:`, {
      fileType, // Campo del FormData (ej: 'image', 'video', 'file')
      fileName,
      mimeType, // MIME type válido
      uri: file.uri.substring(0, 50) + '...',
      originalType: file.type,
    });

    // En React Native, el FormData espera el objeto directamente
    // El objeto se pasa como segundo parámetro sin 'as any' para mejor type safety
    formData.append(fileType, fileData);
    
    // Verificar que el FormData se construyó correctamente
    console.log(`📤 [VISITS API] FormData constructed:`, {
      fileType,
      fileName,
      mimeType,
      hasComment: !!comment,
      fileDataStructure: {
        hasUri: !!fileData.uri,
        hasType: !!fileData.type,
        hasName: !!fileData.name,
        typeValue: fileData.type,
      },
    });

    // Agregar comentario si existe
    if (comment) {
      formData.append('comment', comment);
    }

    const url = `/visits/${visitId}/evidence`;
    const fullUrl = `${CONFIG.API.GATEWAY_URL}${url}`;

    // Logging siempre activo para debugging de uploads
    console.log(`📤 [VISITS API] Uploading evidence:`, {
      visitId,
      fileType,
      fileName: fileName,
      fileType_mime: file.type,
      fileUri: file.uri.substring(0, 80) + (file.uri.length > 80 ? '...' : ''),
      hasComment: !!comment,
      url,
      fullUrl,
      baseURL: CONFIG.API.GATEWAY_URL,
    });

    // Obtener headers antes de hacer la petición
    const token = await SecureStorageAdapter.getItem('token');
    const userDataString = await SecureStorageAdapter.getItem('user');
    let userId = '';
    let userRole = '';
    
    if (userDataString) {
      try {
        const user = JSON.parse(userDataString);
        userId = user.id?.toString() || '';
        // Buscar el rol gerente_cuenta o usar el primero
        if (user.roles && user.roles.length > 0) {
          userRole = user.roles.find((r: string) => r.includes('gerente_cuenta')) || user.roles[0];
        }
      } catch (e) {
        console.warn('⚠️ [VISITS API] Error parsing user data:', e);
      }
    }

    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    if (!userId) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    if (!userRole) {
      throw new Error('No se pudo obtener el rol del usuario');
    }

    console.log(`📤 [VISITS API] Request config:`, {
      url,
      baseURL: CONFIG.API.GATEWAY_URL,
      fullUrl,
      hasToken: !!token,
      userId,
      userRole,
    });

    // En React Native, fetch maneja FormData mejor que axios
    // Usar fetch directamente para evitar problemas con Content-Type
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': userId,
      'X-User-Role': userRole,
      // NO establecer Content-Type - fetch lo establecerá automáticamente con boundary
    };

    console.log(`📤 [VISITS API] Using fetch for FormData upload`);
    console.log(`📤 [VISITS API] Fetch config:`, {
      url: fullUrl,
      method: 'POST',
      headers: {
        ...headers,
        Authorization: 'Bearer ***',
      },
      hasFormData: true,
    });

    // Verificar conectividad básica antes de intentar el upload
    try {
      const healthCheckUrl = `${CONFIG.API.GATEWAY_URL}/health`;
      console.log(`🔍 [VISITS API] Checking connectivity to: ${healthCheckUrl}`);
      const healthResponse = await fetch(healthCheckUrl, { method: 'GET', timeout: 5000 } as any).catch(() => null);
      if (healthResponse && healthResponse.ok) {
        console.log(`✅ [VISITS API] Server is reachable`);
      } else {
        console.warn(`⚠️ [VISITS API] Health check failed, but continuing with upload attempt`);
      }
    } catch (healthError) {
      console.warn(`⚠️ [VISITS API] Health check error (continuing):`, healthError);
    }

    let fetchResponse: Response;
    try {
      console.log(`📤 [VISITS API] Starting fetch request to: ${fullUrl}`);
      fetchResponse = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: formData,
      });
      console.log(`📥 [VISITS API] Fetch response received:`, {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        ok: fetchResponse.ok,
      });
    } catch (fetchError) {
      // Capturar errores de red de fetch
      console.error(`❌ [VISITS API] Fetch network error:`, {
        message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        name: fetchError instanceof Error ? fetchError.name : 'Unknown',
        stack: fetchError instanceof Error ? fetchError.stack : undefined,
        fullUrl,
        errorType: fetchError instanceof TypeError ? 'TypeError' : 'Other',
      });
      
      // Lanzar error formateado
      throw {
        isAxiosError: false,
        response: undefined,
        message: fetchError instanceof Error ? fetchError.message : 'Network request failed',
        code: 'ERR_NETWORK',
      };
    }

    if (!fetchResponse.ok) {
      const errorData = await fetchResponse.json().catch(() => ({}));
      throw {
        response: {
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          data: errorData,
        },
        isAxiosError: false,
      };
    }

    const responseData = await fetchResponse.json();
    
    // Crear un objeto similar a axios response para compatibilidad
    const response = {
      data: responseData as UploadEvidenceResponse,
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
    };
    
    console.log(`✅ [VISITS API] Upload successful:`, {
      visitId,
      count: response.data.count,
      items: response.data.items?.length || 0,
    });
    
    return response.data;
  } catch (error) {
    // Log detallado del error
    const isAxiosError = axios.isAxiosError(error);
    const isFetchError = error && typeof error === 'object' && 'response' in error;
    
    const errorDetails = {
      visitId,
      fileName: file.name,
      fileUri: file.uri.substring(0, 80) + (file.uri.length > 80 ? '...' : ''),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorCode: error instanceof Error ? (error as any).code : undefined,
      isAxiosError,
      isFetchError,
      errorResponse: isFetchError ? (error as any).response : null,
      axiosError: isAxiosError ? {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
        },
      } : null,
    };

    // Logging siempre activo para debugging de errores
    console.error(`❌ [VISITS API] Upload error details:`, errorDetails);

    // Si es un error de fetch con respuesta, formatearlo como axios error
    if (isFetchError && (error as any).response) {
      const fetchError = error as any;
      // Convertir a formato axios para que formatVisitsError lo maneje
      const axiosLikeError = {
        isAxiosError: true,
        response: fetchError.response,
        message: fetchError.response?.statusText || 'Network Error',
      };
      throw formatVisitsError(axiosLikeError);
    }

    // Si es un error de red (sin respuesta), verificar más detalles
    if (isAxiosError && !error.response) {
      const networkError = error as AxiosError;
      console.error(`❌ [VISITS API] Network error (no response):`, {
        message: networkError.message,
        code: networkError.code,
        errno: (networkError as any).errno,
        syscall: (networkError as any).syscall,
        address: (networkError as any).address,
        port: (networkError as any).port,
        request: {
          url: networkError.config?.url,
          baseURL: networkError.config?.baseURL,
          method: networkError.config?.method,
          headers: {
            Authorization: networkError.config?.headers?.Authorization ? 'Bearer ***' : 'missing',
            'X-User-Id': networkError.config?.headers?.['X-User-Id'] || 'missing',
            'X-User-Role': networkError.config?.headers?.['X-User-Role'] || 'missing',
            'Content-Type': networkError.config?.headers?.['Content-Type'] || 'missing',
          },
        },
      });
    }

    throw formatVisitsError(error);
  }
};

// ========================================
// MANEJO DE ERRORES
// ========================================

/**
 * Formatea errores de la API de visitas para mostrar al usuario
 */
export const formatVisitsError = (error: unknown): Error => {
  // Manejar errores de axios
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>;

    // Error de red (sin conexión)
    if (!axiosError.response) {
      return new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
    }

    // Error con respuesta del servidor
    const status = axiosError.response.status;
    const detail = axiosError.response.data?.detail || axiosError.response.data?.message;

    switch (status) {
      case 400:
        return new Error(detail || 'Datos inválidos. Por favor verifica la información.');
      case 401:
        return new Error(detail || 'No estás autenticado. Por favor inicia sesión.');
      case 403:
        return new Error(detail || 'No tienes permiso para realizar esta acción. Verifica que tu rol sea "gerente_cuenta".');
      case 404:
        return new Error('Visita no encontrada.');
      case 413:
        return new Error('El archivo es demasiado grande. El tamaño máximo es 15MB.');
      case 415:
        return new Error('Formato de archivo no soportado. Usa imágenes (JPEG, PNG) o videos (MP4).');
      case 422:
        return new Error(detail || 'Datos de validación incorrectos. Por favor verifica los campos obligatorios.');
      case 500:
        return new Error(detail || 'Error del servidor. Por favor intenta más tarde.');
      default:
        return new Error(detail || `Error ${status}. Por favor intenta de nuevo.`);
    }
  }

  // Manejar errores tipo axios (de fetch convertidos)
  if (error && typeof error === 'object' && 'isAxiosError' in error && (error as any).response) {
    const axiosLikeError = error as { response: { status: number; data?: { detail?: string; message?: string } } };
    const status = axiosLikeError.response.status;
    const detail = axiosLikeError.response.data?.detail || axiosLikeError.response.data?.message;

    switch (status) {
      case 400:
        return new Error(detail || 'Datos inválidos. Por favor verifica la información.');
      case 401:
        return new Error(detail || 'No estás autenticado. Por favor inicia sesión.');
      case 403:
        return new Error(detail || 'No tienes permiso para realizar esta acción. Verifica que tu rol sea "gerente_cuenta".');
      case 404:
        return new Error('Visita no encontrada.');
      case 413:
        return new Error('El archivo es demasiado grande. El tamaño máximo es 15MB.');
      case 415:
        return new Error('Formato de archivo no soportado. Usa imágenes (JPEG, PNG) o videos (MP4).');
      case 422:
        return new Error(detail || 'Datos de validación incorrectos. Por favor verifica los campos obligatorios.');
      case 500:
        return new Error(detail || 'Error del servidor. Por favor intenta más tarde.');
      default:
        return new Error(detail || `Error ${status}. Por favor intenta de nuevo.`);
    }
  }

  // Error desconocido
  if (error instanceof Error) {
    return error;
  }

  return new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
};

