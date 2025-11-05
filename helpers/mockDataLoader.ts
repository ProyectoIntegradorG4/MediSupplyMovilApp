/**
 * Helper para cargar datos mock desde archivos JSON
 * 
 * Incluye caché en memoria y simulación de delay de red
 * Cumple con requisito de < 2 segundos de respuesta según HUs
 * 
 * @module helpers/mockDataLoader
 */

// Importar JSONs estáticamente (React Native requiere imports estáticos)
// @ts-ignore - TypeScript puede quejarse de imports JSON, pero funciona en runtime
import mockProducts from '../data/mock-products.json';
// @ts-ignore
import mockOrders from '../data/mock-orders.json';

// Cache en memoria para evitar múltiples cargas
const cache = new Map<string, any>();

// Mapa de archivos a datos
const dataMap = new Map<string, any>([
  ['data/mock-products.json', mockProducts],
  ['data/mock-orders.json', mockOrders],
]);

/**
 * Simula delay de red (máximo 1.5s para cumplir < 2s de las HUs)
 * 
 * @param minDelay Delay mínimo en ms (default: 300ms)
 * @param maxDelay Delay máximo en ms (default: 1500ms)
 * @returns Promise que se resuelve después del delay
 */
const simulateNetworkDelay = (
  minDelay: number = 300,
  maxDelay: number = 1500
): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Carga un archivo JSON con caché y delay simulado
 * 
 * @param filePath Ruta relativa al archivo JSON desde la raíz del proyecto
 * @param useCache Si usar caché (default: true)
 * @param forceDelay Si forzar delay mínimo (default: true)
 * @returns Promise con los datos del JSON
 * 
 * @example
 * ```typescript
 * const products = await loadMockData('data/mock-products.json');
 * ```
 */
export const loadMockData = async <T = any>(
  filePath: string,
  useCache: boolean = true,
  forceDelay: boolean = true
): Promise<T> => {
  // Verificar caché
  if (useCache && cache.has(filePath)) {
    console.log(`📦 [MockLoader] Cache hit: ${filePath}`);
    // Delay mínimo incluso desde caché (simula validación)
    if (forceDelay) {
      await simulateNetworkDelay(100, 300);
    }
    return cache.get(filePath) as T;
  }

  try {
    // Simular delay de red antes de cargar
    if (forceDelay) {
      await simulateNetworkDelay();
    }

    // Obtener datos del mapa (importados estáticamente)
    const data = dataMap.get(filePath);

    if (!data) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    // Guardar en caché
    if (useCache) {
      cache.set(filePath, data);
      console.log(`💾 [MockLoader] Cached: ${filePath}`);
    }

    console.log(`✅ [MockLoader] Loaded: ${filePath}`);
    return data;
  } catch (error) {
    console.error(`❌ [MockLoader] Error loading ${filePath}:`, error);
    throw new Error(`Failed to load mock data from ${filePath}: ${error}`);
  }
};

/**
 * Limpia el caché de datos mock
 * Útil para testing o forzar recarga
 */
export const clearMockCache = (): void => {
  cache.clear();
  console.log('🗑️ [MockLoader] Cache cleared');
};

/**
 * Carga múltiples archivos JSON en paralelo
 * 
 * @param filePaths Array de rutas de archivos
 * @returns Promise con array de datos en el mismo orden
 */
export const loadMultipleMockData = async <T = any[]>(
  filePaths: string[]
): Promise<T[]> => {
  const promises = filePaths.map((path) => loadMockData(path));
  return Promise.all(promises) as Promise<T[]>;
};

/**
 * Pre-carga archivos JSON comunes
 * Útil para mejorar UX al inicio de la app
 */
export const preloadCommonMockData = async (): Promise<void> => {
  const commonFiles = [
    'data/mock-products.json',
    'data/mock-orders.json',
  ];

  try {
    await loadMultipleMockData(commonFiles);
    console.log('✅ [MockLoader] Pre-loaded common mock data');
  } catch (error) {
    console.warn('⚠️ [MockLoader] Failed to pre-load some mock data:', error);
  }
};

