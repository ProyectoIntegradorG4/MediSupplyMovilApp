import React, { useEffect } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useLanguageStore } from '../store/useLanguageStore';
import { SupportedLocale } from '@/core/i18n/types';

/**
 * Hook personalizado que integra react-i18next con el store de Zustand
 * Proporciona tipado TypeScript y sincronización automática con el store
 */
export function useTranslation() {
  const { locale } = useLanguageStore();
  const { t, i18n, ready } = useI18nTranslation();

  // Sincronizar i18next con el store cuando cambia el locale
  useEffect(() => {
    if (ready && i18n.language !== locale) {
      console.log('🌐 [useTranslation] Sincronizando idioma:', locale);
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n, ready]);

  // Función de traducción segura que retorna la key si i18n no está listo
  const safeT = (key: string, options?: any) => {
    if (!ready) {
      console.warn('🌐 [useTranslation] i18n no está listo, retornando key:', key);
      return key;
    }
    return t(key, options);
  };

  return {
    t: safeT,
    locale,
    ready,
    changeLanguage: (newLocale: SupportedLocale) => {
      useLanguageStore.getState().setLanguage(newLocale);
    },
  };
}

