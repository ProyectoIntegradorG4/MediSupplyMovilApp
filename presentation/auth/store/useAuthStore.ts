import { authCheckStatus, authLogin } from '@/core/auth/actions/auth-actions';
import { User } from '@/core/auth/interface/user';
import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import { create } from 'zustand';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

export interface AuthState {
  status: AuthStatus;
  token?: string;
  user?: User;

  login: (email: string, password: string) => Promise<boolean>;
  checkStatus: () => Promise<void>;
  logout: () => Promise<void>;

  changeStatus: (token?: string, user?: User) => Promise<boolean>;
  getRoleBasedRoute: () => string;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Properties
  status: 'checking',
  token: undefined,
  user: undefined,

  // Actions
  changeStatus: async (token?: string, user?: User) => {
    console.log('🔄 [Store] changeStatus llamado con:', {
      hasToken: !!token,
      hasUser: !!user,
      user: user
    });

    if (!token || !user) {
      console.log('❌ [Store] Token o user faltante, estableciendo unauthenticated');
      set({ status: 'unauthenticated', token: undefined, user: undefined });
      await SecureStorageAdapter.deleteItem('token');
      return false;
    }

    console.log('✅ [Store] Estableciendo authenticated con usuario:', {
      id: user.id,
      email: user.email,
      roles: user.roles
    });

    set({
      status: 'authenticated',
      token: token,
      user: user,
    });

    await SecureStorageAdapter.setItem('token', token);
    console.log('💾 [Store] Token guardado en storage');

    return true;
  },

  login: async (email: string, password: string) => {
    console.log('🏪 [Store] Ejecutando login...');
    const resp = await authLogin(email, password);
    console.log('🏪 [Store] Respuesta de authLogin:', resp);

    if (!resp) {
      console.log('❌ [Store] authLogin devolvió null');
      return false;
    }

    console.log('🏪 [Store] Usuario:', {
      id: resp.user.id,
      email: resp.user.email,
      roles: resp.user.roles,
      fullName: resp.user.fullName
    });

    const result = await get().changeStatus(resp?.token, resp?.user);
    console.log('🏪 [Store] changeStatus resultado:', result);
    return result;
  },

  checkStatus: async () => {
    const resp = await authCheckStatus();
    get().changeStatus(resp?.token, resp?.user);
  },

  logout: async () => {
    SecureStorageAdapter.deleteItem('token');

    set({ status: 'unauthenticated', token: undefined, user: undefined });
  },

  getRoleBasedRoute: () => {
    const { user } = get();
    console.log('🧭 [Store] getRoleBasedRoute - Usuario:', user);

    if (!user?.roles || user.roles.length === 0) {
      console.log('🧭 [Store] Sin roles, redirigiendo a home');
      return '/(products-app)/(home)';
    }

    console.log('🧭 [Store] Roles del usuario:', user.roles);

    // Verificar roles específicos
    if (user.roles.includes('gerente_cuenta')) {
      console.log('🧭 [Store] Rol: gerente_cuenta → clientes');
      return '/(products-app)/(clientes)';
    }

    if (user.roles.includes('usuario_institucional')) {
      console.log('🧭 [Store] Rol: usuario_institucional → entregas');
      return '/(products-app)/(entregas)';
    }

    // Rol por defecto si no coincide con ninguno
    console.log('🧭 [Store] Rol no reconocido, redirigiendo a home');
    return '/(products-app)/(home)';
  },

  hasRole: (role: string) => {
    const { user } = get();
    return user?.roles?.includes(role) || false;
  },
}));
