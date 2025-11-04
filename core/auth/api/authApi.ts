/**
 * API Client para Autenticación y Registro de Usuarios
 * 
 * IMPORTANTE: API Gateway Migration
 * - Todas las peticiones pasan por el API Gateway (NGINX en puerto 80)
 * - El gateway enruta según el path:
 *   - /api/v1/auth/*  → auth-service:8004
 *   - /api/v1/users/* → user-service:8001
 * 
 * @module core/auth/api/authApi
 */

import { CONFIG } from '@/constants/config';
import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import axios from 'axios';

/**
 * Cliente Axios configurado para peticiones de autenticación
 * Base URL: API Gateway (puerto 80)
 */
const authApi = axios.create({
  baseURL: CONFIG.API.GATEWAY_URL,
  timeout: CONFIG.API.TIMEOUT,
});

/**
 * Interceptor para agregar token JWT automáticamente a todas las peticiones
 */
authApi.interceptors.request.use(async (config) => {
  const token = await SecureStorageAdapter.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Interceptor para logging en modo desarrollo
 */
if (CONFIG.DEBUG) {
  authApi.interceptors.request.use((config) => {
    console.log(`🌐 [AUTH API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  });

  authApi.interceptors.response.use(
    (response) => {
      console.log(`✅ [AUTH API] ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error(`❌ [AUTH API] ${error.response?.status || 'ERROR'} ${error.config?.url}`);
      return Promise.reject(error);
    }
  );
}

// ========================================
// TIPOS Y INTERFACES
// ========================================

/**
 * Datos para registro de nuevo usuario institucional
 */
export interface RegisterUserData {
  nombre: string;
  email: string;
  nit: string;
  password: string;
}

/**
 * Respuesta del endpoint de registro
 */
export interface RegisterUserResponse {
  mensaje: string;
  usuario_id: number;
  email: string;
  token: string;
}

/**
 * Datos para login
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Respuesta del endpoint de login
 */
export interface LoginResponse {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  token: string;
  nit?: string; // NIT del usuario para uso en pedidos
}

/**
 * Respuesta del endpoint de verificación de token
 */
export interface VerifyTokenResponse {
  valid: boolean;
  user_id: number;
  email: string;
  roles: string[];
}

/**
 * Estructura de errores de validación de FastAPI (422)
 */
export interface APIValidationError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

/**
 * Estructura de errores del servicio de usuarios
 */
export interface UserServiceError {
  error: string;
  detalles: {
    campo?: string;
    message?: string;
    [key: string]: any;
  };
}

// ========================================
// FUNCIONES DE API
// ========================================

/**
 * Registra un nuevo usuario institucional
 * 
 * Endpoint: POST /api/v1/users/register
 * Gateway enruta a: user-service:8001
 * 
 * Validaciones del backend:
 * - Email único
 * - NIT válido y autorizado
 * - Contraseña con complejidad requerida (8+ chars, mayúsculas, minúsculas, números, símbolos)
 * 
 * @param userData Datos del usuario a registrar
 * @returns Respuesta con ID de usuario y token JWT
 * @throws Error con detalles de validación si falla
 */
export const registerUser = async (userData: RegisterUserData): Promise<RegisterUserResponse> => {
  const { data } = await authApi.post<RegisterUserResponse>('/api/v1/users/register', userData);
  return data;
};

/**
 * Inicia sesión con email y contraseña
 * 
 * Endpoint: POST /api/v1/auth/login
 * Gateway enruta a: auth-service:8004
 * 
 * @param credentials Email y contraseña del usuario
 * @returns Token de acceso y datos del usuario
 * @throws Error si credenciales son inválidas
 */
export const login = async (credentials: LoginData): Promise<LoginResponse> => {
  const { data } = await authApi.post<LoginResponse>('/api/v1/auth/login', credentials);
  return data;
};

/**
 * Verifica la validez de un token JWT
 * 
 * Endpoint: GET /api/v1/auth/verify-token
 * Gateway enruta a: auth-service:8004
 * 
 * @param token Token JWT a verificar
 * @returns Información del usuario si el token es válido
 * @throws Error si el token es inválido o expiró
 */
export const verifyToken = async (token: string): Promise<VerifyTokenResponse> => {
  const { data } = await authApi.get<VerifyTokenResponse>(`/api/v1/auth/verify-token`, {
    params: { token }
  });
  return data;
};

/**
 * Cierra sesión (logout)
 * 
 * Endpoint: POST /api/v1/auth/logout
 * Gateway enruta a: auth-service:8004
 * 
 * Nota: También debe limpiar el token almacenado localmente
 */
export const logout = async (): Promise<void> => {
  try {
    await authApi.post('/api/v1/auth/logout');
  } finally {
    // Limpiar token local siempre, incluso si el servidor falla
    await SecureStorageAdapter.deleteItem('token');
  }
};

// ========================================
// UTILIDADES DE MANEJO DE ERRORES
// ========================================

/**
 * Formatea errores de validación de FastAPI (422)
 * 
 * Convierte el array de errores en un objeto campo → mensaje
 * 
 * @param errors Array de errores de validación
 * @returns Objeto con campos como keys y mensajes de error como values
 */
export const formatValidationErrors = (errors: APIValidationError['detail']): Record<string, string> => {
  const formatted: Record<string, string> = {};

  errors.forEach(error => {
    // El campo está en la última posición del array 'loc'
    const field = error.loc[error.loc.length - 1];
    formatted[field] = error.msg;
  });

  return formatted;
};

/**
 * Formatea errores del servicio de usuarios
 * 
 * Extrae el campo y mensaje de error de la estructura del backend
 * 
 * @param error Error estructurado del servicio
 * @returns Objeto con campos como keys y mensajes de error como values
 */
export const formatUserServiceErrors = (error: UserServiceError): Record<string, string> => {
  const formatted: Record<string, string> = {};

  if (error.detalles?.campo) {
    formatted[error.detalles.campo] = error.detalles.message || error.error;
  } else {
    // Error genérico sin campo específico
    formatted['_general'] = error.error;
  }

  return formatted;
};

export { authApi };
