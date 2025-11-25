#!/usr/bin/env node

/**
 * Script de diagnóstico de conectividad para MediSupply App
 * Ayuda a identificar problemas de red en desarrollo
 */

const { execSync } = require('child_process');
const os = require('os');

console.log('🔍 DIAGNÓSTICO DE CONECTIVIDAD - MediSupply App');
console.log('================================================\n');

// Obtener información de red
function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address,
          netmask: iface.netmask
        });
      }
    }
  }
  
  return addresses;
}

// Probar conectividad con una URL
async function testUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return { success: true, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('📱 Información del sistema:');
  console.log(`   OS: ${os.platform()} ${os.release()}`);
  console.log(`   Node: ${process.version}`);
  console.log(`   Arquitectura: ${os.arch()}\n`);

  console.log('🌐 Interfaces de red disponibles:');
  const networkInfo = getNetworkInfo();
  networkInfo.forEach(info => {
    console.log(`   ${info.interface}: ${info.address} (${info.netmask})`);
  });
  console.log();

  // Resolver Gateway según .env
  const ENV = (process.env.EXPO_PUBLIC_ENV || 'aws').toLowerCase();
  const gateway =
    ENV === 'aws'
      ? (process.env.EXPO_PUBLIC_GATEWAY_URL || 'http://medisupply-alb-656658498.us-east-1.elb.amazonaws.com')
      : (process.env.EXPO_PUBLIC_LOCAL_GATEWAY_URL || 'http://192.168.10.5:80');

  // Endpoints a probar en el gateway
  const urlsToTest = [
    `${gateway}/`,
    `${gateway}/health`,
    `${gateway}/api/health`,
    `${gateway}/api/v1/auth/health`,
    `${gateway}/api/v1/users/health`,
  ];

  console.log('🔗 Probando conectividad con URLs:');
  for (const url of urlsToTest) {
    console.log(`\n   Probando: ${url}`);
    const result = await testUrl(url);
    if (result.success) {
      console.log(`   ✅ Conectado (Status: ${result.status})`);
    } else {
      console.log(`   ❌ Error: ${result.error}`);
    }
  }

  console.log('\n📋 Recomendaciones:');
  console.log('   1. Verifica EXPO_PUBLIC_ENV=aws|local en tu .env');
  console.log('   2. Para local, usa EXPO_PUBLIC_LOCAL_GATEWAY_URL con tu IP y puerto 80');
  console.log('   3. Para AWS, usa EXPO_PUBLIC_GATEWAY_URL sin puerto explícito');
  console.log('   4. En Android físico, asegúrate de que el dispositivo está en la misma red');
  
  if (networkInfo.length > 0) {
    console.log(`\n💡 IP recomendada para dispositivos físicos: ${networkInfo[0].address}`);
  }
  
  console.log('\n🔧 Comandos útiles:');
  console.log('   # Verificar reachability del gateway:');
  console.log('   curl -i ' + gateway + '/health');
}

main().catch(console.error);

