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
        BASE_URL: getApiUrl(),
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
 */
const ANDROID_FALLBACK_URLS = [
    'http://10.0.2.2:8001',      // Emulador Android estándar
    'http://192.168.101.90:8001',    // IP real de la máquina
    'http://192.168.101.90:8001',  // IP específica del docker-compose
    'http://localhost:8001',      // Localhost (solo para web)
    'http://127.0.0.1:8001'       // IP loopback (solo para web)
];

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
            return process.env.EXPO_PUBLIC_API_URL_IOS || 'http://192.168.5.107:8001';
        case 'android':
            return process.env.EXPO_PUBLIC_API_URL_ANDROID || 'http://10.0.2.2:8001';
        default:
            return 'http://localhost:8001';
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
    console.log('🌐 API URL:', CONFIG.API.BASE_URL);
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