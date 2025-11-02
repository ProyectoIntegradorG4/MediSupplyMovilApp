/**
 * Script de diagnóstico rápido de conectividad
 * Prueba todas las posibles URLs de tu backend
 * 
 * Uso: node scripts/quick-connectivity-test.js
 */

const http = require('http');
const { URL } = require('url');

require('dotenv').config();

const URLS_TO_TEST = [
    process.env.EXPO_PUBLIC_GATEWAY_URL || 'http://192.168.101.90',
    'http://192.168.101.90',
    'http://10.0.2.2',
    'http://localhost',
    'http://127.0.0.1'
];

const ENDPOINTS = [
    '/',
    '/api/v1/auth/login',
    '/health',
    '/api/health'
];

function testUrl(baseUrl, endpoint = '/') {
    return new Promise((resolve) => {
        const url = new URL(endpoint, baseUrl);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            method: 'GET',
            timeout: 3000
        };

        const req = http.request(options, (res) => {
            resolve({
                url: `${baseUrl}${endpoint}`,
                reachable: true,
                status: res.statusCode
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                url: `${baseUrl}${endpoint}`,
                reachable: false,
                error: 'Timeout'
            });
        });

        req.on('error', (error) => {
            resolve({
                url: `${baseUrl}${endpoint}`,
                reachable: false,
                error: error.code || error.message
            });
        });

        req.end();
    });
}

async function runQuickTest() {
    console.log('🔍 Prueba rápida de conectividad\n');
    console.log('═══════════════════════════════════════\n');

    const results = [];

    for (const baseUrl of URLS_TO_TEST) {
        console.log(`\n📡 Probando: ${baseUrl}`);

        for (const endpoint of ENDPOINTS) {
            const result = await testUrl(baseUrl, endpoint);
            results.push(result);

            if (result.reachable) {
                console.log(`  ✅ ${endpoint} - Status: ${result.status}`);
            } else {
                console.log(`  ❌ ${endpoint} - ${result.error}`);
            }
        }
    }

    console.log('\n═══════════════════════════════════════\n');
    console.log('📊 Resumen:\n');

    const reachable = results.filter(r => r.reachable);

    if (reachable.length > 0) {
        console.log('✅ URLs alcanzables:');
        reachable.forEach(r => {
            console.log(`   ${r.url} (${r.status})`);
        });
    } else {
        console.log('❌ No se pudo alcanzar ninguna URL');
        console.log('\n💡 Sugerencias:');
        console.log('   1. Verifica que el backend esté corriendo');
        console.log('   2. Verifica tu IP local con: ipconfig (Windows) o ifconfig (Mac/Linux)');
        console.log('   3. Actualiza el archivo .env con la IP correcta');
        console.log('   4. Reinicia el backend y esta prueba');
    }

    console.log('');
}

runQuickTest();
