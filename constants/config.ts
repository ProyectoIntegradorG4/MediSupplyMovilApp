/**
 * Configuración centralizada de la aplicación
 * Usa variables de entorno para mayor flexibilidad
 */

import { Platform } from 'react-native';

// === CONFIGURACIÓN DE ENTORNO ===
export const CONFIG = {
    // Entorno actual
    STAGE: process.env.EXPO_PUBLIC_STAGE || 'dev',
    IS_DEV: process.env.EXPO_PUBLIC_STAGE === 'dev',
    IS_PROD: process.env.EXPO_PUBLIC_STAGE === 'prod',

    // Debug
    DEBUG: process.env.EXPO_DEBUG === 'true',

    // URLs de API según plataforma
    API: {
        GATEWAY_URL: getGatewayUrl(), // API Gateway (NGINX en puerto 80)
        BASE_URL: getApiUrl(), // DEPRECATED: Mantener por compatibilidad
        AUTH_URL: getAuthApiUrl(), // DEPRECATED: Mantener por compatibilidad
        TIMEOUT: 10000, // 10 segundos
    },

    // Configuración de autenticación
    AUTH: {
        TOKEN_KEY: 'auth_token',
        REFRESH_TOKEN_KEY: 'refresh_token',
    },

    // Configuración de la app
    APP: {
        NAME: 'MediSupply',
        VERSION: '1.0.0',
    }
};

/**
 * URLs de fallback para Android (diferentes configuraciones de red)
 * Incluyen puerto 80 para el API Gateway
 */
const ANDROID_FALLBACK_URLS = [
    'http://10.0.2.2:80',      // Emulador Android estándar (puerto 80)
    'http://192.168.10.5:80', // IP real de la máquina (puerto 80)
    'http://localhost:80',     // Localhost (solo para web)
    'http://127.0.0.1:80'      // IP loopback (solo para web)
];

/**
 * Obtiene la URL del API Gateway (NGINX) según la plataforma y entorno
 * El API Gateway enruta a todos los servicios desde un único punto de entrada (puerto 80)
 * 
 * IMPORTANTE: Todas las peticiones deben pasar por el gateway en puerto 80
 * El gateway enruta según el path:
 *   - /api/v1/auth/*       → auth-service:8004
 *   - /api/v1/users/*      → user-service:8001
 *   - /api/v1/validate/*   → nit-validation-service:8002
 *   - /api/v1/audits/*     → audit-service:8003
 */
function getGatewayUrl(): string {
    const stage = process.env.EXPO_PUBLIC_STAGE || 'dev';

    if (stage === 'prod') {
        return process.env.EXPO_PUBLIC_GATEWAY_URL || 'https://api.medisupply.com';
    }

    // Si hay URL específica en variables de entorno, usarla (asegurar que tenga puerto 80)
    if (process.env.EXPO_PUBLIC_GATEWAY_URL) {
        let url = process.env.EXPO_PUBLIC_GATEWAY_URL;
        // Si no tiene puerto, agregar :80
        if (!url.match(/:\d+$/)) {
            url = `${url}:80`;
        }
        return url;
    }

    // Desarrollo: usar URL específica por plataforma para el API Gateway (puerto 80)
    switch (Platform.OS) {
        case 'ios':
            // iOS Simulator puede usar la IP de la máquina directamente
            const iosUrl = process.env.EXPO_PUBLIC_GATEWAY_URL_IOS || 'http://192.168.10.5:80';
            // Asegurar que tenga puerto
            return iosUrl.match(/:\d+$/) ? iosUrl : `${iosUrl}:80`;
        case 'android':
            // Android Emulator usa 10.0.2.2 para acceder al host
            // Android físico usa la IP de la máquina en la misma red
            const androidUrl = process.env.EXPO_PUBLIC_GATEWAY_URL_ANDROID || 'http://10.0.2.2:80';
            // Asegurar que tenga puerto
            return androidUrl.match(/:\d+$/) ? androidUrl : `${androidUrl}:80`;
        default:
            return 'http://localhost:80';
    }
}

/**
 * Obtiene la URL de la API según la plataforma y entorno
 */
function getApiUrl(): string {
    const stage = process.env.EXPO_PUBLIC_STAGE || 'dev';

    if (stage === 'prod') {
        return process.env.EXPO_PUBLIC_API_URL || 'https://api.medisupply.com';
    }

    // Si hay URL específica en variables de entorno, usarla
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Desarrollo: usar URL específica por plataforma para el user-service
    switch (Platform.OS) {
        case 'ios':
            return process.env.EXPO_PUBLIC_API_URL_IOS || 'http://192.168.101.78';
        case 'android':
            return process.env.EXPO_PUBLIC_API_URL_ANDROID || 'http://10.0.2.2';
        default:
            return 'http://localhost';
    }
}

/**
 * Obtiene la URL del Auth Service según la plataforma y entorno
 */
function getAuthApiUrl(): string {
    const stage = process.env.EXPO_PUBLIC_STAGE || 'dev';

    if (stage === 'prod') {
        return process.env.EXPO_PUBLIC_AUTH_URL || 'https://auth.medisupply.com';
    }

    // Si hay URL específica en variables de entorno, usarla
    if (process.env.EXPO_PUBLIC_AUTH_URL) {
        return process.env.EXPO_PUBLIC_AUTH_URL;
    }

    // Desarrollo: usar URL específica por plataforma para el auth-service
    switch (Platform.OS) {
        case 'ios':
            return process.env.EXPO_PUBLIC_AUTH_URL_IOS || 'http://192.168.10.5';
        case 'android':
            return process.env.EXPO_PUBLIC_AUTH_URL_ANDROID || 'http://192.168.10.5';
        default:
            return 'http://localhost';
    }
}

/**
 * Utilidad para logging de configuración (solo en desarrollo)
 */
export const logConfig = () => {
    if (!CONFIG.IS_DEV) return;

    console.log('=== CONFIGURACIÓN DE LA APP ===');
    console.log('🚀 Entorno:', CONFIG.STAGE);
    console.log('📱 Plataforma:', Platform.OS);
    console.log('🌐 Gateway URL:', CONFIG.API.GATEWAY_URL);
    console.log('🌐 API URL (deprecated):', CONFIG.API.BASE_URL);
    console.log('🐛 Debug:', CONFIG.DEBUG);
    console.log('================================');
};

/**
 * Valida que las variables de entorno requeridas estén configuradas
 */
export const validateEnvVars = () => {
    const required = [
        'EXPO_PUBLIC_STAGE'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.warn('⚠️ Variables de entorno faltantes:', missing);
    }

    return missing.length === 0;
};

/**
 * Obtiene URLs alternativas para Android en caso de fallo de conexión
 */
export const getAndroidFallbackUrls = (): string[] => {
    return ANDROID_FALLBACK_URLS;
};

/**
 * Prueba la conectividad con una URL específica
 */
export const testApiConnection = async (url: string): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        // Intentar con diferentes endpoints
        const endpoints = ['/health', '/', '/register'];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${url}${endpoint}`, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                clearTimeout(timeoutId);
                if (response.ok || response.status === 405) { // 405 = Method Not Allowed es OK para algunos endpoints
                    return true;
                }
            } catch (endpointError) {
                // Continuar con el siguiente endpoint
                continue;
            }
        }

        clearTimeout(timeoutId);
        return false;
    } catch (error) {
        return false;
    }
};