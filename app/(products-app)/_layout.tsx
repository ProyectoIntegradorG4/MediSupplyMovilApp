import { Redirect, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import LogoutIconButton from '@/presentation/auth/components/LogoutIconButton';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';

const CheckAuthenticationLayout = () => {
  const { status, checkStatus, user, getRoleBasedRoute } = useAuthStore();
  const backgroundColor = useThemeColor({}, 'background');
  const router = useRouter();

  useEffect(() => {
    console.log('📱 [Layout] Verificando estado de autenticación...');
    checkStatus();
  }, []);

  useEffect(() => {
    console.log('📱 [Layout] Estado cambió:', { status, hasUser: !!user });
    if (status === 'authenticated' && user) {
      const roleBasedRoute = getRoleBasedRoute();
      console.log('📱 [Layout] Redirigiendo desde layout a:', roleBasedRoute);
      // Redirigir a la pantalla basada en el rol después de la autenticación
      router.replace(roleBasedRoute as any);
    }
  }, [status, user, getRoleBasedRoute, router]);

  if (status === 'checking') {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 5,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (status === 'unauthenticated') {
    // Guardar la ruta del usuario
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: backgroundColor,
        },
        contentStyle: {
          backgroundColor: backgroundColor,
        },
      }}
    >
      <Stack.Screen
        name="(home)/index"
        options={{
          title: 'Productos',
          headerLeft: () => <LogoutIconButton />,
        }}
      />
      <Stack.Screen
        name="(clientes)/index"
        options={{
          title: 'Clientes',
          headerLeft: () => <LogoutIconButton />,
        }}
      />
      <Stack.Screen
        name="(pedidos)/index"
        options={{
          title: 'Pedidos',
          headerLeft: () => <LogoutIconButton />,
        }}
      />
    </Stack>
  );
};
export default CheckAuthenticationLayout;
