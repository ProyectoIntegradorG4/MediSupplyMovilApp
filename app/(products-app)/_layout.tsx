import { Redirect, Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import BottomNav from '@/presentation/theme/components/BottomNav';
import TopBar from '@/presentation/theme/components/TopBar';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';

// Mapeo de rutas a títulos
const ROUTE_TITLES: Record<string, string> = {
  '/(products-app)/(home)': 'Productos',
  '/(products-app)/(clientes)': 'Gestión de Clientes',
  '/(products-app)/(pedidos)': 'Mis Pedidos',
  '/(products-app)/(rutas)': 'Rutas de Entrega',
  '/(products-app)/(entregas)': 'Mis Entregas',
  '/(products-app)/(perfil)': 'Mi Perfil',
};

const CheckAuthenticationLayout = () => {
  const { status, checkStatus, user, getRoleBasedRoute } = useAuthStore();
  const backgroundColor = useThemeColor({}, 'background');
  const router = useRouter();
  const pathname = usePathname();

  // Obtener el título basado en la ruta actual
  const currentTitle = useMemo(() => {
    const matchedRoute = Object.keys(ROUTE_TITLES).find((route) =>
      pathname.includes(route.replace('/(products-app)', ''))
    );
    return matchedRoute ? ROUTE_TITLES[matchedRoute] : 'MediSupply';
  }, [pathname]);

  useEffect(() => {
    // Solo verificar estado si no estamos ya autenticados
    if (status === 'checking') {
      console.log('📱 [Layout] Verificando estado de autenticación...');
      checkStatus();
    } else if (status === 'authenticated' && user) {
      console.log('📱 [Layout] Ya autenticado, saltando verificación');
    }
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
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Configurar StatusBar */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />

      {/* TopBar compartido para todas las pantallas */}
      <TopBar title={currentTitle} />

      {/* Contenido de las pantallas */}
      <Stack
        screenOptions={{
          headerShown: false, // Ocultamos el header nativo
          contentStyle: {
            backgroundColor: backgroundColor,
          },
        }}
      >
        <Stack.Screen name="(home)/index" />
        <Stack.Screen name="(clientes)/index" />
        <Stack.Screen name="(clientes)/register-visit" />
        <Stack.Screen name="(clientes)/[clienteId]/visits" />
        <Stack.Screen name="(visits)/[visitId]" />
        <Stack.Screen name="(pedidos)/index" />
        <Stack.Screen name="(rutas)/index" />
        <Stack.Screen name="(entregas)/index" />
        <Stack.Screen name="(perfil)/index" />
      </Stack>

      {/* BottomNav compartido para todas las pantallas */}
      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CheckAuthenticationLayout;
