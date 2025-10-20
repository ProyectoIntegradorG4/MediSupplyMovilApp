/**
 * Acciones de Autenticación
 * 
 * Funciones para login, verificación de estado y manejo de sesión
 * Todas las peticiones van a través del API Gateway
 * 
 * @module core/auth/actions/auth-actions
 */

import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import { login as apiLogin, verifyToken } from '../api/authApi';
import { User } from '../interface/user';

export interface AuthResponse {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  token: string;
}

/**
 * Convierte la respuesta de la API a nuestro formato interno
 */
const returnUserToken = (
  data: {
    id: string;
    email: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
    token: string;
  }
): {
  user: User;
  token: string;
} => {
  const user: User = {
    id: data.id,
    email: data.email,
    fullName: data.fullName,
    isActive: data.isActive,
    roles: data.roles,
  };

  return {
    user,
    token: data.token,
  };
};

/**
 * Inicia sesión con email y contraseña
 * 
 * Endpoint usado: POST /api/v1/auth/login
 * 
 * @param email Email del usuario
 * @param password Contraseña del usuario
 * @returns Objeto con usuario y token, o null si falla
 */
export const authLogin = async (email: string, password: string) => {
  email = email.toLowerCase();

  try {
    const data = await apiLogin({ email, password });

    console.log('✅ Login exitoso:', {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      roles: data.roles
    });

    return returnUserToken(data);
  } catch (error) {
    console.log('❌ Auth login error:', error);
    return null;
  }
};

/**
 * Verifica el estado de autenticación actual
 * 
 * Endpoint usado: GET /api/v1/auth/verify-token
 * 
 * @returns Objeto con usuario y token si es válido, o null si no lo es
 */
export const authCheckStatus = async () => {
  try {
    const token = await SecureStorageAdapter.getItem('token');
    if (!token) {
      console.log('ℹ️ No hay token almacenado');
      return null;
    }

    const data = await verifyToken(token);

    if (!data.valid) {
      console.log('⚠️ Token no válido');
      return null;
    }

    console.log('✅ Token válido:', {
      user_id: data.user_id,
      email: data.email,
      roles: data.roles
    });

    // Reconstruir el objeto User con la información del token
    const user: User = {
      id: data.user_id.toString(),
      email: data.email,
      fullName: '', // No disponible en verify-token
      isActive: true,
      roles: data.roles,
    };

    return {
      user,
      token,
    };
  } catch (error) {
    console.log('❌ Auth check status error:', error);
    return null;
  }
};
