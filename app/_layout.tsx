import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/presentation/theme/hooks/useColorScheme';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QueryClient } from '@tanstack/react-query';
import { initI18n } from '@/core/i18n';
import { useLanguageStore } from '@/presentation/i18n/store/useLanguageStore';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const { initialize, locale, isInitialized } = useLanguageStore();
  const [i18nReady, setI18nReady] = useState(false);

  const [loaded] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    KanitRegular: require('../assets/fonts/Kanit-Regular.ttf'),
    KanitBold: require('../assets/fonts/Kanit-Bold.ttf'),
    KanitThin: require('../assets/fonts/Kanit-Thin.ttf'),
  });

  // Inicializar i18n y detectar idioma
  useEffect(() => {
    async function setupI18n() {
      // Primero inicializar el store para detectar/obtener el idioma
      if (!isInitialized) {
        await initialize();
      }
      // Esperar un momento para asegurar que el store se actualizó
      await new Promise(resolve => setTimeout(resolve, 50));
      // Obtener el locale actualizado del store
      const currentLocale = useLanguageStore.getState().locale;
      console.log('🌐 [RootLayout] Inicializando i18n con locale:', currentLocale);
      initI18n(currentLocale);
      setI18nReady(true);
    }
    setupI18n();
  }, []);

  // Sincronizar i18next cuando cambia el locale después de la inicialización
  useEffect(() => {
    if (i18nReady && isInitialized) {
      const { changeLanguage } = require('@/core/i18n');
      console.log('🌐 [RootLayout] Cambiando idioma a:', locale);
      changeLanguage(locale);
    }
  }, [locale, i18nReady, isInitialized]);

  useEffect(() => {
    if (loaded && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, i18nReady]);

  if (!loaded || !i18nReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView
        style={{ backgroundColor: backgroundColor, flex: 1 }}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" /> */}
          </Stack>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
