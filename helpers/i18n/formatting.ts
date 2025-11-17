import { SupportedLocale } from '@/core/i18n/types';
import { useLanguageStore } from '@/presentation/i18n/store/useLanguageStore';

/**
 * Mapea el locale de la app a un locale completo para formateo
 */
const LOCALE_MAP: Record<SupportedLocale, string> = {
  es: 'es-CO', // Español de Colombia
  en: 'en-US', // Inglés de Estados Unidos
};

/**
 * Obtiene el locale completo para formateo basado en el idioma actual
 */
function getFormatLocale(): string {
  const locale = useLanguageStore.getState().locale;
  return LOCALE_MAP[locale] || 'es-CO';
}

/**
 * Formatea un número como moneda según el idioma actual
 * @param amount Cantidad a formatear
 * @returns String formateado (ej: "$1,234.56" o "$1.234,56")
 */
export function formatCurrency(amount: number): string {
  const locale = getFormatLocale();
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD', // O cambiar según necesidad
  }).format(amount);
}

/**
 * Formatea un número según el idioma actual
 * @param amount Número a formatear
 * @returns String formateado
 */
export function formatNumber(amount: number): string {
  const locale = getFormatLocale();
  return amount.toLocaleString(locale);
}

/**
 * Formatea una fecha según el idioma actual
 * @param date Fecha a formatear
 * @param options Opciones de formateo
 * @returns String de fecha formateada
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = getFormatLocale();
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return dateObj.toLocaleDateString(locale, options);
}

/**
 * Formatea una fecha y hora según el idioma actual
 * @param date Fecha a formatear
 * @param options Opciones de formateo
 * @returns String de fecha y hora formateada
 */
export function formatDateTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = getFormatLocale();
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return dateObj.toLocaleString(locale, options);
}

/**
 * Formatea solo la hora según el idioma actual
 * @param date Fecha a formatear
 * @param options Opciones de formateo
 * @returns String de hora formateada
 */
export function formatTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = getFormatLocale();
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return dateObj.toLocaleTimeString(locale, options);
}

