import { SupportedLocale, SUPPORTED_LOCALES } from '@/core/i18n/types';
import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import { detectDeviceLanguage } from '@/helpers/i18n/language-detector';
import { create } from 'zustand';

const LANGUAGE_STORAGE_KEY = 'app_language';

export interface LanguageState {
  locale: SupportedLocale;
  isInitialized: boolean;
  
  initialize: () => Promise<void>;
  setLanguage: (locale: SupportedLocale) => Promise<void>;
  getStoredLanguage: () => Promise<SupportedLocale | null>;
}

export const useLanguageStore = create<LanguageState>()((set, get) => ({
  locale: 'es', // Valor inicial por defecto
  isInitialized: false,

  /**
   * Obtiene el idioma guardado del storage
   */
  getStoredLanguage: async (): Promise<SupportedLocale | null> => {
    try {
      const stored = await SecureStorageAdapter.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) {
        const normalized = stored.toLowerCase();
        if (SUPPORTED_LOCALES.includes(normalized as SupportedLocale)) {
          return normalized as SupportedLocale;
        }
      }
      return null;
    } catch (error) {
      console.warn('Error reading stored language:', error);
      return null;
    }
  },

  /**
   * Inicializa el idioma: primero busca en storage, si no existe detecta del dispositivo
   */
  initialize: async () => {
    if (get().isInitialized) {
      return; // Ya está inicializado
    }

    try {
      // 1. Intentar obtener idioma guardado
      const storedLanguage = await get().getStoredLanguage();
      
      if (storedLanguage) {
        console.log('🌐 [LanguageStore] Usando idioma guardado:', storedLanguage);
        set({ locale: storedLanguage, isInitialized: true });
        return;
      }

      // 2. Si no hay idioma guardado, detectar del dispositivo
      const deviceLanguage = detectDeviceLanguage();
      console.log('🌐 [LanguageStore] Detectado idioma del dispositivo:', deviceLanguage);
      
      set({ locale: deviceLanguage, isInitialized: true });
      
      // Guardar el idioma detectado para futuras sesiones
      await SecureStorageAdapter.setItem(LANGUAGE_STORAGE_KEY, deviceLanguage);
    } catch (error) {
      console.error('Error initializing language:', error);
      set({ locale: 'es', isInitialized: true }); // Fallback a español
    }
  },

  /**
   * Cambia el idioma y lo persiste
   */
  setLanguage: async (locale: SupportedLocale) => {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      console.warn('Unsupported locale:', locale);
      return;
    }

    try {
      set({ locale });
      await SecureStorageAdapter.setItem(LANGUAGE_STORAGE_KEY, locale);
      console.log('🌐 [LanguageStore] Idioma cambiado a:', locale);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
}));

