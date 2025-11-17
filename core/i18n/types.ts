import 'react-i18next';
import esTranslations from './locales/es/translation.json';
import enTranslations from './locales/en/translation.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof esTranslations & typeof enTranslations;
    };
  }
}

export type SupportedLocale = 'es' | 'en';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['es', 'en'];

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  es: 'Español',
  en: 'English',
};

