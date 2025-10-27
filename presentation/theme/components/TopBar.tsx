import LogoutIconButton from '@/presentation/auth/components/LogoutIconButton';
import React from 'react';
import { Image, StyleSheet, View, ViewProps } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';

interface TopBarProps extends ViewProps {
  title?: string;
  lightColor?: string;
  darkColor?: string;
  showLogout?: boolean;
}

export default function TopBar({ 
  title = 'Clientes', 
  lightColor, 
  darkColor, 
  showLogout = true,
  style,
  ...otherProps 
}: TopBarProps) {
  const primaryColor = useThemeColor({ light: lightColor, dark: darkColor }, 'primary');
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <View style={[styles.container, style]} {...otherProps}>
      {/* Barra superior con logo y botón de logout */}
      <View style={[styles.topSection, { backgroundColor: primaryColor + '30' }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/LogoPrincipal.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {showLogout && (
          <View style={styles.logoutButton}>
            <LogoutIconButton />
          </View>
        )}
      </View>

      {/* Barra inferior con título */}
      <View style={[styles.titleSection, { backgroundColor: primaryColor + '50' }]}>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  topSection: {
    width: '100%',
    height: 80,
    borderRadius: 5,
    justifyContent: 'flex-start',
    paddingTop: 2,
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: {
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 46,
    width: 200,
  },
  logoutButton: {
    position: 'absolute',
    top: 5,
    right: 12,
  },
  titleSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});