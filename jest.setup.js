// Configuración global para pruebas
import '@testing-library/jest-native/extend-expect';

// Mock de Expo
jest.mock('expo-constants', () => ({
  Constants: {
    manifest: null,
  },
}));

// Mock de expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock de react-native-reanimated
jest.mock('react-native-reanimated', () => {
  return {
    Layout: jest.fn(),
    createAnimatedComponent: jest.fn(),
    useAnimatedStyle: jest.fn(),
    withSpring: jest.fn(),
    useSharedValue: jest.fn(),
    withTiming: jest.fn(),
  };
});