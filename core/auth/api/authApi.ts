import { CONFIG, getAndroidFallbackUrls, testApiConnection } from '@/constants/config';
import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import { Platform } from 'react-native';
import axios from 'axios';

/**
 * Instancia de Axios configurada para autenticación
 */
const authApi = axios.create({
  baseURL: CONFIG.API.BASE_URL,
  timeout: CONFIG.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar token de autorización
 */
authApi.interceptors.request.use(async (config) => {
  const token = await SecureStorageAdapter.getItem(CONFIG.AUTH.TOKEN_KEY);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

/**
 * Interceptor para manejar respuestas y errores
 */
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log del error para debugging
    if (CONFIG.IS_DEV) {
      console.error('❌ Auth API Error:', error.response?.data || error.message);
    }
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar storage
      SecureStorageAdapter.deleteItem(CONFIG.AUTH.TOKEN_KEY);
      SecureStorageAdapter.deleteItem(CONFIG.AUTH.REFRESH_TOKEN_KEY);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Interfaces para el registro de usuario
 */
export interface UserRegisterRequest {
  nombre: string;
  email: string;
  nit: string;
  password: string;
}

export interface UserRegisterResponse {
  userId: number;
  institucionId: number;
  rol: string;
  token: string;
  mensaje: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface APIValidationError {
  detail: ValidationError[];
}

export interface UserServiceError {
  error: string;
  detalles: Record<string, any>;
  traceId?: string;
}

/**
 * Servicio de registro de usuario con detección automática de URL
 */
export const registerUser = async (userData: UserRegisterRequest): Promise<UserRegisterResponse> => {
  try {
    // Para Android, intentar encontrar la URL que funciona
    let apiUrl = CONFIG.API.BASE_URL;
    if (Platform.OS === 'android') {
      apiUrl = await findWorkingApiUrl();
      // Actualizar la baseURL del cliente axios si es diferente
      if (apiUrl !== authApi.defaults.baseURL) {
        authApi.defaults.baseURL = apiUrl;
        console.log(`🔄 Cambiando URL base de API a: ${apiUrl}`);
      }
    }
    
    const response = await authApi.post<UserRegisterResponse>('/register', userData);
    
    // Si el registro incluye un token, guardarlo
    if (response.data.token) {
      await SecureStorageAdapter.setItem(CONFIG.AUTH.TOKEN_KEY, response.data.token);
    }
    
    return response.data;
  } catch (error: any) {
    // Si es un error de red en Android, intentar con URLs alternativas
    if (Platform.OS === 'android' && error.code === 'NETWORK_ERROR') {
      console.log('🔄 Error de red, intentando con URLs alternativas...');
      
      const fallbackUrls = getAndroidFallbackUrls().filter(url => url !== authApi.defaults.baseURL);
      
      for (const url of fallbackUrls) {
        try {
          console.log(`🌐 Intentando con: ${url}`);
          const tempApi = axios.create({
            baseURL: url,
            timeout: CONFIG.API.TIMEOUT,
            headers: { 'Content-Type': 'application/json' },
          });
          
          const response = await tempApi.post<UserRegisterResponse>('/register', userData);
          
          // Si funciona, actualizar la URL base para futuras llamadas
          authApi.defaults.baseURL = url;
          console.log(`✅ Conexión exitosa con: ${url}`);
          
          // Guardar token si existe
          if (response.data.token) {
            await SecureStorageAdapter.setItem(CONFIG.AUTH.TOKEN_KEY, response.data.token);
          }
          
          return response.data;
        } catch (retryError: any) {
          console.log(`❌ Error con ${url}:`, retryError.message || retryError);
          continue;
        }
      }
    }
    
    // Re-lanzar el error para que pueda ser manejado por el componente
    throw error;
  }
};

/**
 * Utilidad para formatear errores de validación de la API
 */
export const formatValidationErrors = (errors: ValidationError[]): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  errors.forEach((error) => {
    // Obtener el nombre del campo del path de localización
    const fieldName = error.loc[error.loc.length - 1];
    if (typeof fieldName === 'string') {
      formattedErrors[fieldName] = error.msg;
    }
  });
  
  return formattedErrors;
};

/**
 * Utilidad para formatear errores del servicio de usuarios
 */
export const formatUserServiceErrors = (error: UserServiceError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  // Mapear errores específicos del servicio a campos del formulario
  if (error.detalles) {
    Object.entries(error.detalles).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Mapear nombres de campos de la API a campos del formulario
        const formField = key === 'nombre' ? 'username' : key;
        formattedErrors[formField] = value;
      }
    });
  }
  
  return formattedErrors;
};

/**
 * Encuentra la URL de API que funciona para Android
 */
export const findWorkingApiUrl = async (): Promise<string> => {
  // Si no es Android, usar la configuración por defecto
  if (Platform.OS !== 'android') {
    return CONFIG.API.BASE_URL;
  }

  // Para Android, probar diferentes URLs
  const urlsToTest = [CONFIG.API.BASE_URL, ...getAndroidFallbackUrls()];
  
  console.log('🔍 Probando conectividad con URLs:', urlsToTest);
  
  for (const url of urlsToTest) {
    console.log(`🌐 Probando: ${url}`);
    const isWorking = await testApiConnection(url);
    if (isWorking) {
      console.log(`✅ URL funcionando: ${url}`);
      return url;
    }
    console.log(`❌ URL no disponible: ${url}`);
  }
  
  console.warn('⚠️ No se encontró ninguna URL funcionando, usando la por defecto');
  return CONFIG.API.BASE_URL;
};

export { authApi };

