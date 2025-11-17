import * as Localization from 'expo-localization';
import { SupportedLocale, SUPPORTED_LOCALES } from '@/core/i18n/types';

/**
 * Detecta el idioma del dispositivo y lo mapea a un idioma soportado
 * @returns El código de idioma soportado ('es' o 'en')
 */
export function detectDeviceLanguage(): SupportedLocale {
  try {
    // Obtener el locale del dispositivo (ej: 'es-CO', 'en-US', 'es-ES')
    const deviceLocale = Localization.locale;
    
    // Extraer el código de idioma base (primeros 2 caracteres)
    const languageCode = deviceLocale.split('-')[0].toLowerCase();
    
    // Si el idioma está soportado, retornarlo
    if (SUPPORTED_LOCALES.includes(languageCode as SupportedLocale)) {
      return languageCode as SupportedLocale;
    }
    
    // Si no está soportado, usar español como default
    return 'es';
  } catch (error) {
    console.warn('Error detecting device language:', error);
    return 'es'; // Fallback a español
  }
}

/**
 * Normaliza un código de idioma a uno soportado
 * @param locale Código de idioma (puede ser 'es', 'es-CO', 'en', 'en-US', etc.)
 * @returns Código de idioma soportado
 */
export function normalizeLocale(locale: string): SupportedLocale {
  const normalized = locale.split('-')[0].toLowerCase();
  
  if (SUPPORTED_LOCALES.includes(normalized as SupportedLocale)) {
    return normalized as SupportedLocale;
  }
  
  return 'es'; // Fallback a español
}

