/**
 * Configuración centralizada de la aplicación
 * 
 * SEPARACIÓN DE CONFIGURACIONES:
 * ==============================
 * 
 * 1. GATEWAY API (cambia según entorno):
 *    - EXPO_PUBLIC_ENV=aws → Gateway AWS (ALB)
 *    - EXPO_PUBLIC_ENV=local → Gateway local (IP desarrollo)
 *    - Solo afecta las peticiones HTTP a los web services
 * 
 * 2. DESARROLLO EXPO (siempre local):
 *    - REACT_NATIVE_PACKAGER_HOSTNAME → IP máquina desarrollo (192.168.10.5)
 *    - EXPO_PACKAGER_HOST → IP máquina desarrollo (192.168.10.5)
 *    - Estas NO cambian, siempre apuntan a tu máquina local
 *    - Configuradas en .env, no en este archivo
 * 
 * USO:
 * - Para prototipar y validar web services, cambia solo EXPO_PUBLIC_ENV
 * - El packager siempre descarga desde tu IP local (192.168.10.5)
 * - Las peticiones API van al gateway según EXPO_PUBLIC_ENV
 */

import { Platform } from 'react-native';

type RuntimeEnv = 'aws' | 'local';

// Función helper segura para obtener variables de entorno
function getEnvVar(key: string, defaultValue?: string): string | undefined {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Silently fail if process.env is not available
  }
  return defaultValue;
}

/**
 * Determina el entorno de ejecución (aws | local)
 * Solo afecta la URL del gateway API, NO las configuraciones de desarrollo
 */
const ENV: RuntimeEnv = ((getEnvVar('EXPO_PUBLIC_ENV') as RuntimeEnv) || 'aws') as RuntimeEnv;

/**
 * Resuelve la URL del gateway API según el entorno configurado
 * 
 * Esta es la ÚNICA configuración que cambia según EXPO_PUBLIC_ENV
 * Todas las peticiones HTTP a los web services usan esta URL
 * 
 * @returns URL del gateway (AWS ALB o IP local)
 */
function resolveGatewayUrl(): string {
    if (ENV === 'aws') {
        // Gateway AWS - ALB (puerto 80 por defecto, no requiere especificar puerto)
        const awsGatewayUrl = getEnvVar('EXPO_PUBLIC_GATEWAY_URL');
        return awsGatewayUrl || 'http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com';
    }
    
    // Gateway local - IP de desarrollo
    // NOTA: Esta IP es para el gateway API, NO para el packager de Expo
    const localGatewayUrl = getEnvVar('EXPO_PUBLIC_LOCAL_GATEWAY_URL');
    return localGatewayUrl || 'http://192.168.10.5:80';
}

export const CONFIG = {
    STAGE: getEnvVar('EXPO_PUBLIC_STAGE', 'dev') || 'dev',
    IS_DEV: (getEnvVar('EXPO_PUBLIC_STAGE', 'dev') || 'dev') === 'dev',
    IS_PROD: getEnvVar('EXPO_PUBLIC_STAGE') === 'prod',
    DEBUG: getEnvVar('EXPO_DEBUG') === 'true',
    ENV, // aws | local
    API: {
        GATEWAY_URL: resolveGatewayUrl(),
        // DEPRECATED: mantener por compatibilidad en logs/componentes antiguos
        BASE_URL: resolveGatewayUrl(),
        AUTH_URL: resolveGatewayUrl(),
        TIMEOUT: 10000,
    },
    AUTH: {
        TOKEN_KEY: 'auth_token',
        REFRESH_TOKEN_KEY: 'refresh_token',
    },
    APP: {
        NAME: 'MediSupply',
        VERSION: '1.0.0',
    }
};

// Endpoints base derivados (para uso optativo)
export const ENDPOINTS = {
    AUTH_BASE: `${CONFIG.API.GATEWAY_URL}/api/v1/auth`,
    USERS_BASE: `${CONFIG.API.GATEWAY_URL}/api/v1/users`,
    CLIENTES_BASE: `${CONFIG.API.GATEWAY_URL}/api/v1/clientes`,
    PEDIDOS_BASE: `${CONFIG.API.GATEWAY_URL}/api/v1/pedidos`,
    ENTREGAS_BASE: `${CONFIG.API.GATEWAY_URL}/api/v1/entregas`,
    RUTAS_BASE: `${CONFIG.API.GATEWAY_URL}/api/v1/rutas-visitas`,
};

/**
 * Registra la configuración actual de la aplicación
 * Útil para debugging y verificar qué gateway se está usando
 */
export const logConfig = () => {
    if (!CONFIG.IS_DEV && !CONFIG.DEBUG) return;
    try {
        console.log('=== CONFIGURACIÓN DE LA APP ===');
        console.log('🚀 Entorno:', CONFIG.STAGE);
        console.log('🌍 Runtime ENV:', CONFIG.ENV, `(${CONFIG.ENV === 'aws' ? 'AWS Gateway' : 'Local Gateway'})`);
        console.log('📱 Plataforma:', Platform.OS);
        console.log('🌐 Gateway API URL:', CONFIG.API.GATEWAY_URL);
        console.log('🐛 Debug:', CONFIG.DEBUG);
        console.log('📋 Variables de entorno:');
        console.log('   EXPO_PUBLIC_ENV:', getEnvVar('EXPO_PUBLIC_ENV') || '(no definida, usando: aws)');
        console.log('   EXPO_PUBLIC_LOCAL_GATEWAY_URL:', getEnvVar('EXPO_PUBLIC_LOCAL_GATEWAY_URL') || '(no definida, usando: http://192.168.10.5:80)');
        console.log('');
        console.log('ℹ️  NOTA: Las configuraciones de Expo packager (REACT_NATIVE_PACKAGER_HOSTNAME,');
        console.log('   EXPO_PACKAGER_HOST) siempre usan tu IP local y NO cambian con EXPO_PUBLIC_ENV');
        console.log('================================');
    } catch (e) {
        // Silently fail if logging fails
    }
};

const stage = getEnvVar('EXPO_PUBLIC_STAGE', 'dev');
if (stage === 'dev' || !stage) {
    setTimeout(() => {
        logConfig();
    }, 100);
}

/**
 * Valida que las variables de entorno requeridas estén configuradas
 * 
 * NOTA: No valida variables de desarrollo de Expo (packager hostname)
 *       porque estas siempre deben estar en .env apuntando a IP local
 */
export const validateEnvVars = () => {
    try {
        const requiredBase = ['EXPO_PUBLIC_STAGE'];
        const missingBase = requiredBase.filter((k) => !getEnvVar(k));

        const envMode: RuntimeEnv = ((getEnvVar('EXPO_PUBLIC_ENV') as RuntimeEnv) || 'aws') as RuntimeEnv;
        
        // Para local, EXPO_PUBLIC_LOCAL_GATEWAY_URL es opcional (tiene fallback)
        // Para aws, no requiere variables adicionales (usa hardcoded ALB)
        const missingByEnv: string[] = [];

        const missing = [...missingBase, ...missingByEnv];
        if (missing.length > 0) {
            console.warn('⚠️ Variables de entorno faltantes:', missing);
        }
        return missing.length === 0;
    } catch (e) {
        return false;
    }
};

export const testApiConnection = async (url: string): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const endpoints = ['/health', '/', '/api/health'];
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${url}${endpoint}`, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' },
                });
                clearTimeout(timeoutId);
                if (response.ok || response.status === 405) {
                    return true;
                }
            } catch {
                continue;
            }
        }
        clearTimeout(timeoutId);
        return false;
    } catch {
        return false;
    }
};