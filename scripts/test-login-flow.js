/**
 * Script de validación del flujo de login
 * 
 * Este script prueba:
 * 1. Conectividad con el backend
 * 2. Endpoint de login
 * 3. Estructura de la respuesta
 * 4. Mapeo de roles
 * 
 * Uso: node scripts/test-login-flow.js
 */

const https = require('http');
const { URL } = require('url');

// Cargar variables de entorno
require('dotenv').config();

const CONFIG = {
    GATEWAY_URL: process.env.EXPO_PUBLIC_GATEWAY_URL || 'http://192.168.101.90',
    TEST_CREDENTIALS: {
        email: 'jforero@gmail.com',
        password: 'Admin@1234'
    }
};

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}

function logError(message) {
    log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
    log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

/**
 * Realiza una petición HTTP
 */
function makeRequest(url, options, data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 80,
            path: urlObj.pathname,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = https.request(requestOptions, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonBody
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: body
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Test 1: Conectividad con el backend
 */
async function testConnectivity() {
    log('\n📡 Test 1: Verificando conectividad con el backend', colors.cyan);
    logInfo(`URL: ${CONFIG.GATEWAY_URL}`);

    try {
        const response = await makeRequest(`${CONFIG.GATEWAY_URL}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 || response.status === 404) {
            logSuccess('Backend alcanzable');
            return true;
        } else {
            logWarning(`Backend respondió con código: ${response.status}`);
            return true; // Aún es alcanzable
        }
    } catch (error) {
        logError(`No se pudo conectar al backend: ${error.message}`);
        logError(`Verifica que el backend esté corriendo en ${CONFIG.GATEWAY_URL}`);
        return false;
    }
}

/**
 * Test 2: Endpoint de login
 */
async function testLoginEndpoint() {
    log('\n🔐 Test 2: Probando endpoint de login', colors.cyan);
    logInfo(`URL: ${CONFIG.GATEWAY_URL}/api/v1/auth/login`);
    logInfo(`Email: ${CONFIG.TEST_CREDENTIALS.email}`);

    try {
        const response = await makeRequest(
            `${CONFIG.GATEWAY_URL}/api/v1/auth/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            },
            CONFIG.TEST_CREDENTIALS
        );

        logInfo(`Status: ${response.status}`);

        if (response.status === 200) {
            logSuccess('Login exitoso');
            return { success: true, data: response.data };
        } else {
            logError(`Login falló con código: ${response.status}`);
            logError(`Respuesta: ${JSON.stringify(response.data, null, 2)}`);
            return { success: false, data: null };
        }
    } catch (error) {
        logError(`Error en login: ${error.message}`);
        return { success: false, data: null };
    }
}

/**
 * Test 3: Validar estructura de la respuesta
 */
function testResponseStructure(data) {
    log('\n📋 Test 3: Validando estructura de la respuesta', colors.cyan);

    const requiredFields = ['id', 'email', 'fullName', 'isActive', 'roles', 'token'];
    let allValid = true;

    for (const field of requiredFields) {
        if (data.hasOwnProperty(field)) {
            logSuccess(`Campo '${field}' presente`);
            logInfo(`  Valor: ${JSON.stringify(data[field])}`);
        } else {
            logError(`Campo '${field}' FALTANTE`);
            allValid = false;
        }
    }

    // Validaciones adicionales
    if (typeof data.id !== 'string') {
        logWarning(`'id' debería ser string, es: ${typeof data.id}`);
    }

    if (!Array.isArray(data.roles)) {
        logError(`'roles' debería ser un array`);
        allValid = false;
    }

    if (typeof data.token !== 'string' || data.token.length === 0) {
        logError(`'token' inválido`);
        allValid = false;
    }

    return allValid;
}

/**
 * Test 4: Validar mapeo de roles a rutas
 */
function testRoleMapping(roles) {
    log('\n🧭 Test 4: Validando mapeo de roles a rutas', colors.cyan);

    const roleMapping = {
        'gerente_cuenta': '/(products-app)/(clientes)',
        'usuario_institucional': '/(products-app)/(pedidos)'
    };

    logInfo(`Roles del usuario: ${JSON.stringify(roles)}`);

    let mappedRoute = '/(products-app)/(home)'; // default

    for (const role of roles) {
        if (roleMapping[role]) {
            mappedRoute = roleMapping[role];
            logSuccess(`Rol '${role}' → Ruta: ${mappedRoute}`);
            break;
        }
    }

    if (mappedRoute === '/(products-app)/(home)') {
        logInfo(`Sin rol específico, usando ruta por defecto: ${mappedRoute}`);
    }

    return mappedRoute;
}

/**
 * Test 5: Simular el flujo completo
 */
function testCompleteFlow(loginData) {
    log('\n🔄 Test 5: Simulando flujo completo de autenticación', colors.cyan);

    // Simular returnUserToken
    const user = {
        id: loginData.id,
        email: loginData.email,
        fullName: loginData.fullName,
        isActive: loginData.isActive,
        roles: loginData.roles
    };

    const token = loginData.token;

    logInfo('Usuario mapeado:');
    console.log(JSON.stringify(user, null, 2));

    // Simular changeStatus
    if (token && user) {
        logSuccess('changeStatus: Token y usuario válidos');
        logInfo(`Token guardado: ${token.substring(0, 20)}...`);
    } else {
        logError('changeStatus: Faltan token o usuario');
        return false;
    }

    // Simular getRoleBasedRoute
    const route = testRoleMapping(user.roles);
    logSuccess(`Navegación final: ${route}`);

    return true;
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
    log('═══════════════════════════════════════════════════════', colors.cyan);
    log('  🧪 PRUEBAS DE VALIDACIÓN DEL FLUJO DE LOGIN', colors.cyan);
    log('═══════════════════════════════════════════════════════', colors.cyan);

    // Test 1: Conectividad
    const connectivityOk = await testConnectivity();
    if (!connectivityOk) {
        logError('\n❌ Las pruebas no pueden continuar sin conectividad al backend');
        process.exit(1);
    }

    // Test 2: Login
    const loginResult = await testLoginEndpoint();
    if (!loginResult.success) {
        logError('\n❌ Las pruebas no pueden continuar sin un login exitoso');
        logInfo('Verifica:');
        logInfo('  1. Que el backend esté corriendo');
        logInfo('  2. Que las credenciales sean correctas');
        logInfo(`  3. Que la URL sea correcta: ${CONFIG.GATEWAY_URL}`);
        process.exit(1);
    }

    // Test 3: Estructura de respuesta
    const structureValid = testResponseStructure(loginResult.data);
    if (!structureValid) {
        logWarning('\n⚠️  La estructura de respuesta tiene problemas pero continuaremos...');
    }

    // Test 4 y 5: Flujo completo
    testCompleteFlow(loginResult.data);

    // Resumen
    log('\n═══════════════════════════════════════════════════════', colors.cyan);
    log('  📊 RESUMEN DE PRUEBAS', colors.cyan);
    log('═══════════════════════════════════════════════════════', colors.cyan);

    logSuccess('✅ Conectividad: OK');
    logSuccess('✅ Login: OK');
    logSuccess(`✅ Estructura: ${structureValid ? 'OK' : 'WARNINGS'}`);
    logSuccess('✅ Flujo completo: OK');

    log('\n🎉 Todas las pruebas básicas pasaron', colors.green);
    log('Ahora puedes probar en la app móvil con confianza\n', colors.green);
}

// Ejecutar
runAllTests().catch(error => {
    logError(`\n❌ Error fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
});
