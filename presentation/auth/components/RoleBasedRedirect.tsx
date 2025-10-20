import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { status, user, getRoleBasedRoute } = useAuthStore();

  useEffect(() => {
    if (status === 'authenticated' && user) {
      const roleBasedRoute = getRoleBasedRoute();
      
      // Solo redirigir si no estamos ya en la ruta correcta
      const currentRoute = router.canGoBack() ? 'current' : '/(products-app)/(home)';
      
      // Redirigir a la pantalla basada en el rol
      if (roleBasedRoute !== currentRoute) {
        router.replace(roleBasedRoute);
      }
    }
  }, [status, user, getRoleBasedRoute]);

  return <>{children}</>;
};
