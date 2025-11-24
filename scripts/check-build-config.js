#!/usr/bin/env node

/**
 * Script de verificación de configuración para build de APK
 * Verifica que todos los archivos y configuraciones necesarias estén presentes
 */

const fs = require('fs');
const path = require('path');

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const checkmark = `${colors.green}✅${colors.reset}`;
const cross = `${colors.red}❌${colors.reset}`;
const warning = `${colors.yellow}⚠️${colors.reset}`;
const info = `${colors.blue}ℹ️${colors.reset}`;

let errors = [];
let warnings = [];
let success = [];

console.log('\n==========================================');
console.log('  📱 Verificación de Configuración');
console.log('  MediSupply - Build APK');
console.log('==========================================\n');

// Verificar archivos esenciales
const essentialFiles = [
  'package.json',
  'app.json',
  'tsconfig.json',
];

console.log(`${info} Verificando archivos esenciales...\n`);
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ${checkmark} ${file}`);
    success.push(file);
  } else {
    console.log(`  ${cross} ${file} - NO ENCONTRADO`);
    errors.push(`Archivo faltante: ${file}`);
  }
});

// Verificar app.json
console.log(`\n${info} Verificando configuración de app.json...\n`);
if (fs.existsSync('app.json')) {
  try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    const expo = appJson.expo || {};
    const android = expo.android || {};
    
    // Verificar package
    if (android.package) {
      console.log(`  ${checkmark} package: ${android.package}`);
      success.push('app.json: package');
    } else {
      console.log(`  ${cross} package - NO CONFIGURADO`);
      errors.push('app.json: Falta el campo "package" en android');
    }
    
    // Verificar versionCode
    if (android.versionCode) {
      console.log(`  ${checkmark} versionCode: ${android.versionCode}`);
      success.push('app.json: versionCode');
    } else {
      console.log(`  ${cross} versionCode - NO CONFIGURADO`);
      errors.push('app.json: Falta el campo "versionCode" en android');
    }
    
    // Verificar version
    if (expo.version) {
      console.log(`  ${checkmark} version: ${expo.version}`);
      success.push('app.json: version');
    } else {
      console.log(`  ${warning} version - NO CONFIGURADO`);
      warnings.push('app.json: Falta el campo "version"');
    }
    
    // Verificar iconos
    const iconFiles = [
      android.adaptiveIcon?.foregroundImage,
      android.adaptiveIcon?.backgroundImage,
    ].filter(Boolean);
    
    iconFiles.forEach(icon => {
      if (fs.existsSync(icon)) {
        console.log(`  ${checkmark} Icono: ${icon}`);
      } else {
        console.log(`  ${warning} Icono faltante: ${icon}`);
        warnings.push(`Icono faltante: ${icon}`);
      }
    });
    
    // Verificar permisos
    if (android.permissions && android.permissions.length > 0) {
      console.log(`  ${checkmark} Permisos configurados: ${android.permissions.length}`);
      success.push('app.json: permisos');
    } else {
      console.log(`  ${warning} No hay permisos configurados`);
      warnings.push('app.json: No hay permisos configurados');
    }
    
  } catch (error) {
    console.log(`  ${cross} Error al leer app.json: ${error.message}`);
    errors.push(`Error al leer app.json: ${error.message}`);
  }
}

// Verificar node_modules
console.log(`\n${info} Verificando dependencias...\n`);
if (fs.existsSync('node_modules')) {
  console.log(`  ${checkmark} node_modules existe`);
  success.push('node_modules');
} else {
  console.log(`  ${cross} node_modules - NO ENCONTRADO (ejecuta: yarn install)`);
  errors.push('node_modules no existe. Ejecuta: yarn install');
}

// Verificar variables de entorno
console.log(`\n${info} Verificando variables de entorno...\n`);
if (fs.existsSync('.env')) {
  console.log(`  ${checkmark} .env existe`);
  success.push('.env');
  
  // Leer y verificar variables importantes
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredVars = [
    'EXPO_PUBLIC_STAGE',
    'EXPO_PUBLIC_GATEWAY_URL',
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`  ${checkmark} ${varName} configurada`);
    } else {
      console.log(`  ${warning} ${varName} - NO CONFIGURADA`);
      warnings.push(`Variable de entorno faltante: ${varName}`);
    }
  });
} else {
  console.log(`  ${warning} .env - NO ENCONTRADO (considera crear uno desde env.example)`);
  warnings.push('.env no existe. Considera crear uno desde env.example');
}

// Verificar eas.json (opcional)
console.log(`\n${info} Verificando configuración de EAS Build...\n`);
if (fs.existsSync('eas.json')) {
  console.log(`  ${checkmark} eas.json existe`);
  try {
    const easJson = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
    if (easJson.build?.preview) {
      console.log(`  ${checkmark} Perfil 'preview' configurado`);
      success.push('eas.json: preview');
    } else {
      console.log(`  ${warning} Perfil 'preview' no configurado`);
      warnings.push('eas.json: Falta el perfil preview');
    }
  } catch (error) {
    console.log(`  ${warning} Error al leer eas.json: ${error.message}`);
    warnings.push(`Error al leer eas.json: ${error.message}`);
  }
} else {
  console.log(`  ${warning} eas.json - NO ENCONTRADO (opcional, solo necesario para EAS Build)`);
  console.log(`  ${info} Puedes crearlo desde eas.json.example`);
  warnings.push('eas.json no existe (opcional para EAS Build)');
}

// Verificar EAS CLI (opcional)
console.log(`\n${info} Verificando herramientas...\n`);
const { execSync } = require('child_process');

try {
  const easVersion = execSync('eas --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
  console.log(`  ${checkmark} EAS CLI instalado: v${easVersion}`);
  success.push('EAS CLI');
} catch (error) {
  console.log(`  ${warning} EAS CLI - NO INSTALADO (opcional, solo necesario para EAS Build)`);
  console.log(`  ${info} Instalar con: npm install -g eas-cli`);
  warnings.push('EAS CLI no instalado (opcional)');
}

// Resumen
console.log('\n==========================================');
console.log('  📊 Resumen de Verificación');
console.log('==========================================\n');

console.log(`${colors.green}Éxitos: ${success.length}${colors.reset}`);
console.log(`${colors.yellow}Advertencias: ${warnings.length}${colors.reset}`);
console.log(`${colors.red}Errores: ${errors.length}${colors.reset}\n`);

if (errors.length > 0) {
  console.log(`${colors.red}❌ Errores encontrados:${colors.reset}\n`);
  errors.forEach(error => {
    console.log(`  • ${error}`);
  });
  console.log('');
}

if (warnings.length > 0) {
  console.log(`${colors.yellow}⚠️  Advertencias:${colors.reset}\n`);
  warnings.forEach(warning => {
    console.log(`  • ${warning}`);
  });
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log(`${colors.green}✅ ¡Todo está configurado correctamente!${colors.reset}\n`);
  console.log('Puedes proceder con el build usando:');
  console.log(`  ${colors.blue}yarn build:apk:eas${colors.reset}  (EAS Build)`);
  console.log(`  ${colors.blue}yarn build:apk:local${colors.reset}  (Build Local)\n`);
  process.exit(0);
} else if (errors.length === 0) {
  console.log(`${colors.yellow}⚠️  Configuración básica OK, pero hay advertencias${colors.reset}\n`);
  console.log('Puedes proceder con el build, pero revisa las advertencias.\n');
  process.exit(0);
} else {
  console.log(`${colors.red}❌ Hay errores que deben corregirse antes del build${colors.reset}\n`);
  process.exit(1);
}

