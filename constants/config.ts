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
 * Obtiene la URL de la API según la plataforma y entorno
 */
function getApiUrl(): string {
    const stage = process.env.EXPO_PUBLIC_STAGE || 'dev';

    if (stage === 'prod') {
        return process.env.EXPO_PUBLIC_API_URL || 'https://api.medisupply.com';
    }

    // Desarrollo: usar URL específica por plataforma
    switch (Platform.OS) {
        case 'ios':
            return process.env.EXPO_PUBLIC_API_URL_IOS || 'http://localhost:3000/api';
        case 'android':
            return process.env.EXPO_PUBLIC_API_URL_ANDROID || 'http://10.0.2.2:3000/api';
        default:
            return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
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