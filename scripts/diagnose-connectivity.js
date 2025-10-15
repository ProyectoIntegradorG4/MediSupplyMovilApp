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

  // URLs a probar
  const urlsToTest = [
    'http://localhost:8001',
    'http://127.0.0.1:8001',
    'http://10.0.2.2:8001',
    ...networkInfo.map(info => `http://${info.address}:8001`)
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
  console.log('   1. Para Android Emulator: usar http://10.0.2.2:8001');
  console.log('   2. Para Android físico: usar la IP de tu máquina');
  console.log('   3. Para iOS Simulator: usar http://localhost:8001');
  console.log('   4. Para web: usar http://localhost:8001');
  
  if (networkInfo.length > 0) {
    console.log(`\n💡 IP recomendada para dispositivos físicos: ${networkInfo[0].address}`);
  }
  
  console.log('\n🔧 Comandos útiles:');
  console.log('   # Para Android Emulator (ADB reverse):');
  console.log('   adb reverse tcp:8001 tcp:8001');
  console.log('\n   # Para verificar puertos abiertos:');
  console.log('   netstat -an | grep 8001');
}

main().catch(console.error);

