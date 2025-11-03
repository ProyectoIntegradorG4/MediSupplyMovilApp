/**
 * Sistema de tema centralizado para MediSupply App
 * Compatible con modo Dark y Light, siguiendo principios de 12 Factor App
 * 
 * Este archivo contiene todas las definiciones de colores, fuentes y estilos
 * que deben ser utilizadas consistentemente en toda la aplicación.
 */

import { Platform } from 'react-native';

// Colores base
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

/**
 * Paleta de colores completa para modo Light y Dark
 * Todos los componentes deben usar estos colores del tema
 */
export const Colors = {
  light: {
    // Colores principales
    text: '#11181C',
    background: '#fff',
    primary: '#3D64F4',
    secondary: '#0a7ea4',
    tint: tintColorLight,
    
    // Colores de UI
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    
    // Colores semánticos
    error: '#e74c3c',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
    
    // Colores de estado con variantes para dark mode
    errorBackground: '#F8D7DA',
    errorText: '#721C24',
    successBackground: '#D4EDDA',
    successText: '#155724',
    warningBackground: '#FFF3CD',
    warningText: '#856404',
    infoBackground: '#D1ECF1',
    infoText: '#0C5460',
    
    // Colores de UI componentes
    border: '#ccc',
    borderActive: '#3D64F4',
    card: '#fff',
    cardBorder: '#e0e0e0',
    placeholder: '#5c5c5c',
    
    // Colores de imagen/contenedor
    imageBackground: '#f0f0f0',
    iconMuted: '#999',
    
    // Colores para estados de stock
    stockAvailable: '#28a745',
    stockLow: '#ffc107',
    stockMedium: '#3D64F4',
    stockUnavailable: '#6c757d',
    
    // Colores para badges de estado
    badgePendingBg: '#FFF3CD',
    badgePendingText: '#856404',
    badgeSentBg: '#D1ECF1',
    badgeSentText: '#0C5460',
    badgeDeliveredBg: '#D4EDDA',
    badgeDeliveredText: '#155724',
    badgeCancelledBg: '#F8D7DA',
    badgeCancelledText: '#721C24',
    
    // Colores de texto sobre fondos
    textOnPrimary: '#FFFFFF',
    textOnDark: '#FFFFFF',
  },
  dark: {
    // Colores principales
    text: '#ECEDEE',
    background: '#1F2B43',
    primary: '#3D64F4',
    secondary: '#0a7ea4',
    tint: tintColorDark,
    
    // Colores de UI
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    
    // Colores semánticos (más suaves para dark mode)
    error: '#ff6b6b',
    success: '#51cf66',
    warning: '#ffd43b',
    info: '#74c0fc',
    
    // Colores de estado adaptados para dark mode
    errorBackground: '#5C1A1A',
    errorText: '#ff9999',
    successBackground: '#1A3A1A',
    successText: '#7feb94',
    warningBackground: '#3A2F1A',
    warningText: '#ffd43b',
    infoBackground: '#1A2A3A',
    infoText: '#74c0fc',
    
    // Colores de UI componentes (más oscuros)
    border: '#4a5568',
    borderActive: '#3D64F4',
    card: '#2d3748',
    cardBorder: '#4a5568',
    placeholder: '#9BA1A6',
    
    // Colores de imagen/contenedor
    imageBackground: '#2d3748',
    iconMuted: '#718096',
    
    // Colores para estados de stock (más brillantes en dark)
    stockAvailable: '#51cf66',
    stockLow: '#ffd43b',
    stockMedium: '#3D64F4',
    stockUnavailable: '#718096',
    
    // Colores para badges de estado adaptados para dark
    badgePendingBg: '#3A2F1A',
    badgePendingText: '#ffd43b',
    badgeSentBg: '#1A2A3A',
    badgeSentText: '#74c0fc',
    badgeDeliveredBg: '#1A3A1A',
    badgeDeliveredText: '#7feb94',
    badgeCancelledBg: '#5C1A1A',
    badgeCancelledText: '#ff9999',
    
    // Colores de texto sobre fondos
    textOnPrimary: '#FFFFFF',
    textOnDark: '#ECEDEE',
  },
};

/**
 * Configuración de fuentes Kanit
 * Fuentes personalizadas cargadas desde assets/fonts/
 */
export const Fonts = {
  // Fuentes Kanit principales
  regular: 'KanitRegular',
  bold: 'KanitBold',
  thin: 'KanitThin',
  
  // Fuentes del sistema (fallback)
  system: Platform.select({
    ios: 'system-ui',
    android: 'sans-serif',
    web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    default: 'normal',
  }),
  
  // Configuración de tipografía según plataforma
  ...Platform.select({
    ios: {
      sans: 'system-ui',
      serif: 'ui-serif',
      rounded: 'ui-rounded',
      mono: 'ui-monospace',
    },
    default: {
      sans: 'normal',
      serif: 'serif',
      rounded: 'normal',
      mono: 'monospace',
    },
    web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
      rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
  }),
};

/**
 * Tamaños de fuente estándar para mantener consistencia
 */
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 32,
};

/**
 * Espaciado estándar
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

/**
 * Radios de borde estándar
 */
export const BorderRadius = {
  sm: 5,
  md: 8,
  lg: 10,
  xl: 15,
  full: 9999,
};
