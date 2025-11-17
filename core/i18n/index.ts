import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SupportedLocale } from './types';

import esTranslations from './locales/es/translation.json';
import enTranslations from './locales/en/translation.json';

const resources = {
  es: {
    translation: esTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

/**
 * Inicializa i18next con la configuración de la aplicación
 * @param locale Idioma inicial a usar
 */
export function initI18n(locale: SupportedLocale = 'es') {
  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3', // Para React Native
      resources,
      lng: locale,
      fallbackLng: 'es',
      interpolation: {
        escapeValue: false, // React ya escapa valores
      },
      react: {
        useSuspense: false, // No usar Suspense en React Native
      },
    });

  return i18n;
}

/**
 * Cambia el idioma de i18next
 * @param locale Nuevo idioma
 */
export function changeLanguage(locale: SupportedLocale) {
  return i18n.changeLanguage(locale);
}

export default i18n;

