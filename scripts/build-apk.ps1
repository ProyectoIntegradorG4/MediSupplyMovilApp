# ================================================
# Script de Ayuda para Generar APK - MediSupply
# PowerShell Version (Windows)
# ================================================

$ErrorActionPreference = "Stop"

# Colores para output
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Banner
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  📱 MediSupply - Build APK Helper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Error "No se encontró package.json. Asegúrate de estar en la raíz del proyecto."
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js instalado: $nodeVersion"
} catch {
    Write-Error "Node.js no está instalado. Por favor instálalo primero."
    exit 1
}

# Verificar Yarn
try {
    $yarnVersion = yarn --version
    Write-Success "Yarn instalado: v$yarnVersion"
} catch {
    Write-Error "Yarn no está instalado. Por favor instálalo primero."
    exit 1
}

Write-Success "Verificaciones básicas completadas"

# Menú de opciones
Write-Host ""
Write-Host "Selecciona el método de build:"
Write-Host "1) EAS Build (Recomendado - Build en la nube)"
Write-Host "2) Build Local (Requiere Android Studio)"
Write-Host "3) Verificar configuración"
Write-Host "4) Salir"
Write-Host ""
$option = Read-Host "Opción [1-4]"

switch ($option) {
    "1" {
        Write-Info "Iniciando proceso de EAS Build..."
        
        # Verificar EAS CLI
        try {
            $easVersion = eas --version 2>$null
            Write-Success "EAS CLI instalado: v$easVersion"
        } catch {
            Write-Warning "EAS CLI no está instalado. Instalando..."
            npm install -g eas-cli
            Write-Success "EAS CLI instalado"
        }
        
        # Verificar login
        Write-Info "Verificando sesión de Expo..."
        try {
            eas whoami 2>$null | Out-Null
            Write-Success "Sesión activa"
        } catch {
            Write-Warning "No estás logueado. Por favor inicia sesión:"
            eas login
        }
        
        # Verificar eas.json
        if (-not (Test-Path "eas.json")) {
            Write-Warning "eas.json no existe. Creando desde ejemplo..."
            if (Test-Path "eas.json.example") {
                Copy-Item "eas.json.example" "eas.json"
                Write-Success "eas.json creado. Por favor revísalo y ajusta las variables de entorno."
                Read-Host "Presiona Enter para continuar después de revisar eas.json"
            } else {
                Write-Error "No se encontró eas.json.example. Por favor créalo manualmente."
                exit 1
            }
        }
        
        # Verificar app.json
        $appJson = Get-Content "app.json" | ConvertFrom-Json
        if (-not $appJson.expo.android.package) {
            Write-Warning "app.json no tiene 'package' configurado. Por favor agrégalo:"
            Write-Host '  "android": {'
            Write-Host '    "package": "com.medisupply.movilapp",'
            Write-Host '    ...'
            Read-Host "Presiona Enter después de agregar el package"
        }
        
        # Incrementar versionCode
        Write-Info "Verificando versionCode..."
        $currentVersion = $appJson.expo.android.versionCode
        if (-not $currentVersion) {
            $currentVersion = 1
        }
        $newVersion = $currentVersion + 1
        Write-Info "VersionCode actual: $currentVersion"
        Write-Info "Nuevo versionCode: $newVersion"
        $increment = Read-Host "¿Deseas incrementar el versionCode? [s/N]"
        
        if ($increment -eq "s" -or $increment -eq "S") {
            $appJson.expo.android.versionCode = $newVersion
            $appJson | ConvertTo-Json -Depth 10 | Set-Content "app.json"
            Write-Success "VersionCode actualizado a $newVersion"
        }
        
        # Iniciar build
        Write-Host ""
        Write-Info "Iniciando build con EAS..."
        Write-Warning "Esto puede tardar 15-30 minutos..."
        Write-Host ""
        
        eas build --platform android --profile preview
        
        Write-Success "Build completado! Revisa el dashboard de Expo para descargar la APK."
    }
    
    "2" {
        Write-Info "Iniciando proceso de Build Local..."
        
        # Verificar Android SDK
        if (-not $env:ANDROID_HOME) {
            Write-Error "ANDROID_HOME no está configurado. Por favor configúralo en tus variables de entorno."
            exit 1
        }
        
        # Verificar que existe la carpeta android
        if (-not (Test-Path "android")) {
            Write-Info "Generando código nativo Android..."
            npx expo prebuild --platform android
            Write-Success "Código nativo generado"
        } else {
            $regenerate = Read-Host "La carpeta android ya existe. ¿Deseas regenerarla? [s/N]"
            if ($regenerate -eq "s" -or $regenerate -eq "S") {
                Remove-Item -Recurse -Force "android"
                npx expo prebuild --platform android
                Write-Success "Código nativo regenerado"
            }
        }
        
        # Verificar keystore
        if (-not (Test-Path "android/app/medisupply-release-key.keystore")) {
            Write-Warning "Keystore no encontrado. Necesitas generarlo primero."
            Write-Info "Ejecuta manualmente:"
            Write-Host "  cd android/app"
            Write-Host "  keytool -genkeypair -v -storetype PKCS12 -keystore medisupply-release-key.keystore -alias medisupply-key-alias -keyalg RSA -keysize 2048 -validity 10000"
            Write-Host "  cd ../.."
            Read-Host "Presiona Enter después de generar el keystore"
        }
        
        # Compilar
        Write-Info "Compilando APK..."
        Push-Location "android"
        & .\gradlew.bat assembleRelease
        
        if (Test-Path "app/build/outputs/apk/release/app-release.apk") {
            Write-Success "APK generada exitosamente!"
            Write-Info "Ubicación: android/app/build/outputs/apk/release/app-release.apk"
            
            # Copiar a la raíz con nombre descriptivo
            Pop-Location
            $version = $appJson.expo.version
            Copy-Item "android/app/build/outputs/apk/release/app-release.apk" "medisupply-v${version}-release.apk"
            Write-Success "APK copiada a: medisupply-v${version}-release.apk"
        } else {
            Write-Error "No se pudo generar la APK. Revisa los errores arriba."
            Pop-Location
            exit 1
        }
    }
    
    "3" {
        Write-Info "Ejecutando verificación de configuración..."
        node ./scripts/check-build-config.js
    }
    
    "4" {
        Write-Info "Saliendo..."
        exit 0
    }
    
    default {
        Write-Error "Opción inválida"
        exit 1
    }
}

Write-Host ""
Write-Success "Proceso completado!"
Write-Host ""

