import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../hooks/useThemeColor';

interface NavItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}

interface BottomNavProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

function NavItem({ icon, label, active = false, onPress }: NavItemProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        {
          backgroundColor: active ? primaryColor + '20' : 'transparent',
          opacity: pressed ? 0.7 : 1,
          borderColor: primaryColor + '30',
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={28}
          color={active ? primaryColor : textColor}
        />
      </View>
      <Text
        style={[
          styles.label,
          {
            color: active ? primaryColor : textColor,
            fontWeight: active ? 'bold' : 'normal',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function BottomNav({ style, lightColor, darkColor, ...otherProps }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );
  const borderColor = useThemeColor({}, 'text');

  // Determinar qué opciones mostrar según el rol
  const isGerenteCuenta = user?.roles?.includes('gerente_cuenta');
  const isUsuarioInstitucional = user?.roles?.includes('usuario_institucional');

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor, 
          borderTopColor: borderColor + '20',
          paddingBottom: Math.max(insets.bottom, 8), // Respeta el área segura inferior
        },
        style,
      ]}
      {...otherProps}
    >
      <View style={styles.navContainer}>
        {/* Opciones para Gerente de Cuenta */}
        {isGerenteCuenta && (
          <>
            <NavItem
              icon="people"
              label="Clientes"
              active={pathname.includes('/clientes')}
              onPress={() => router.push('/(products-app)/(clientes)')}
            />
            <NavItem
              icon="cart"
              label="Pedidos"
              active={pathname.includes('/pedidos')}
              onPress={() => router.push('/(products-app)/(pedidos)')}
            />
            <NavItem
              icon="map"
              label="Rutas"
              active={pathname.includes('/rutas')}
              onPress={() => router.push('/(products-app)/(rutas)' as any)}
            />
            <NavItem
              icon="person"
              label="Perfil"
              active={pathname.includes('/perfil')}
              onPress={() => router.push('/(products-app)/(perfil)' as any)}
            />
          </>
        )}

        {/* Opciones para Usuario Institucional */}
        {isUsuarioInstitucional && !isGerenteCuenta && (
          <>
            <NavItem
              icon="cube"
              label="Entregas"
              active={pathname.includes('/entregas')}
              onPress={() => router.push('/(products-app)/(entregas)' as any)}
            />
            <NavItem
              icon="cart"
              label="Pedidos"
              active={pathname.includes('/pedidos')}
              onPress={() => router.push('/(products-app)/(pedidos)')}
            />
            <NavItem
              icon="person"
              label="Perfil"
              active={pathname.includes('/perfil')}
              onPress={() => router.push('/(products-app)/(perfil)' as any)}
            />
          </>
        )}

        {/* Opciones por defecto si no tiene rol específico */}
        {!isGerenteCuenta && !isUsuarioInstitucional && (
          <>
            <NavItem
              icon="home"
              label="Inicio"
              active={pathname.includes('/home')}
              onPress={() => router.push('/(products-app)/(home)')}
            />
            <NavItem
              icon="person"
              label="Perfil"
              active={pathname.includes('/perfil')}
              onPress={() => router.push('/(products-app)/(perfil)' as any)}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 64,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
