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
  nit?: string;
  clienteId: number;
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
    nit?: string;
    clienteId: number;
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
    nit: data.nit, // Incluir NIT del usuario
    clienteId: data.clienteId, // Incluir clienteId del usuario institucional
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
      roles: data.roles,
      nit: data.nit,
      clienteId: data.clienteId,
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

    // Intentar obtener el usuario completo del storage
    const userDataString = await SecureStorageAdapter.getItem('user');
    let user: User;

    if (userDataString) {
      try {
        // Si hay usuario guardado, usarlo (contiene fullName y nit)
        user = JSON.parse(userDataString);
        console.log('✅ Usuario recuperado del storage:', {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          nit: user.nit,
          clienteId: user.clienteId,
        });
      } catch (e) {
        console.warn('⚠️ Error parseando usuario del storage, reconstruyendo...');
        // Si falla el parse, reconstruir básico
        user = {
          id: data.user_id.toString(),
          email: data.email,
          fullName: '',
          isActive: true,
          roles: data.roles,
          clienteId: 1,
        };
      }
    } else {
      // Si no hay usuario guardado, reconstruir básico
      console.warn('⚠️ No hay usuario en storage, reconstruyendo básico');
      user = {
        id: data.user_id.toString(),
        email: data.email,
        fullName: '',
        isActive: true,
        roles: data.roles,
        clienteId: 1,
      };
    }

    return {
      user,
      token,
    };
  } catch (error) {
    console.log('❌ Auth check status error:', error);
    return null;
  }
};
