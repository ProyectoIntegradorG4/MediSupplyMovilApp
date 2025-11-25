#!/bin/bash

# ================================================
# Script de Ayuda para Generar APK - MediSupply
# ================================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo ""
echo "=========================================="
echo "  📱 MediSupply - Build APK Helper"
echo "=========================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en la raíz del proyecto."
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi

# Verificar Yarn
if ! command -v yarn &> /dev/null; then
    print_error "Yarn no está instalado. Por favor instálalo primero."
    exit 1
fi

print_success "Verificaciones básicas completadas"

# Menú de opciones
echo ""
echo "Selecciona el método de build:"
echo "1) EAS Build (Recomendado - Build en la nube)"
echo "2) Build Local (Requiere Android Studio)"
echo "3) Verificar configuración"
echo "4) Salir"
echo ""
read -p "Opción [1-4]: " option

case $option in
    1)
        print_info "Iniciando proceso de EAS Build..."
        
        # Verificar EAS CLI
        if ! command -v eas &> /dev/null; then
            print_warning "EAS CLI no está instalado. Instalando..."
            npm install -g eas-cli
            print_success "EAS CLI instalado"
        fi
        
        # Verificar login
        print_info "Verificando sesión de Expo..."
        if ! eas whoami &> /dev/null; then
            print_warning "No estás logueado. Por favor inicia sesión:"
            eas login
        else
            print_success "Sesión activa"
        fi
        
        # Verificar eas.json
        if [ ! -f "eas.json" ]; then
            print_warning "eas.json no existe. Creando desde ejemplo..."
            if [ -f "eas.json.example" ]; then
                cp eas.json.example eas.json
                print_success "eas.json creado. Por favor revísalo y ajusta las variables de entorno."
                read -p "Presiona Enter para continuar después de revisar eas.json..."
            else
                print_error "No se encontró eas.json.example. Por favor créalo manualmente."
                exit 1
            fi
        fi
        
        # Verificar app.json
        if ! grep -q '"package"' app.json 2>/dev/null; then
            print_warning "app.json no tiene 'package' configurado. Agregando..."
            # Esto requeriría edición manual, solo avisamos
            print_warning "Por favor agrega 'package' en la sección android de app.json:"
            echo '  "android": {'
            echo '    "package": "com.medisupply.movilapp",'
            echo '    ...'
            read -p "Presiona Enter después de agregar el package..."
        fi
        
        # Incrementar versionCode
        print_info "Verificando versionCode..."
        current_version=$(grep -o '"versionCode": [0-9]*' app.json | grep -o '[0-9]*' || echo "1")
        new_version=$((current_version + 1))
        print_info "VersionCode actual: $current_version"
        print_info "Nuevo versionCode: $new_version"
        read -p "¿Deseas incrementar el versionCode? [s/N]: " increment
        
        if [[ $increment =~ ^[Ss]$ ]]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/\"versionCode\": $current_version/\"versionCode\": $new_version/" app.json
            else
                # Linux
                sed -i "s/\"versionCode\": $current_version/\"versionCode\": $new_version/" app.json
            fi
            print_success "VersionCode actualizado a $new_version"
        fi
        
        # Iniciar build
        echo ""
        print_info "Iniciando build con EAS..."
        print_warning "Esto puede tardar 15-30 minutos..."
        echo ""
        
        eas build --platform android --profile preview
        
        print_success "Build completado! Revisa el dashboard de Expo para descargar la APK."
        ;;
        
    2)
        print_info "Iniciando proceso de Build Local..."
        
        # Verificar Android SDK
        if [ -z "$ANDROID_HOME" ]; then
            print_error "ANDROID_HOME no está configurado. Por favor configúralo en tus variables de entorno."
            exit 1
        fi
        
        # Verificar que existe la carpeta android
        if [ ! -d "android" ]; then
            print_info "Generando código nativo Android..."
            npx expo prebuild --platform android
            print_success "Código nativo generado"
        else
            print_warning "La carpeta android ya existe. ¿Deseas regenerarla? [s/N]: "
            read regenerate
            if [[ $regenerate =~ ^[Ss]$ ]]; then
                rm -rf android
                npx expo prebuild --platform android
                print_success "Código nativo regenerado"
            fi
        fi
        
        # Verificar keystore
        if [ ! -f "android/app/medisupply-release-key.keystore" ]; then
            print_warning "Keystore no encontrado. Necesitas generarlo primero."
            print_info "Ejecuta manualmente:"
            echo "  cd android/app"
            echo "  keytool -genkeypair -v -storetype PKCS12 -keystore medisupply-release-key.keystore -alias medisupply-key-alias -keyalg RSA -keysize 2048 -validity 10000"
            echo "  cd ../.."
            read -p "Presiona Enter después de generar el keystore..."
        fi
        
        # Compilar
        print_info "Compilando APK..."
        cd android
        ./gradlew assembleRelease
        
        if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
            print_success "APK generada exitosamente!"
            print_info "Ubicación: android/app/build/outputs/apk/release/app-release.apk"
            
            # Copiar a la raíz con nombre descriptivo
            cd ..
            version=$(grep -o '"version": "[^"]*"' app.json | grep -o '[0-9.]*')
            cp android/app/build/outputs/apk/release/app-release.apk "medisupply-v${version}-release.apk"
            print_success "APK copiada a: medisupply-v${version}-release.apk"
        else
            print_error "No se pudo generar la APK. Revisa los errores arriba."
            exit 1
        fi
        ;;
        
    3)
        print_info "Verificando configuración del proyecto..."
        echo ""
        
        # Verificar archivos
        files=("package.json" "app.json" "tsconfig.json")
        for file in "${files[@]}"; do
            if [ -f "$file" ]; then
                print_success "$file existe"
            else
                print_error "$file no existe"
            fi
        done
        
        # Verificar dependencias
        if [ -d "node_modules" ]; then
            print_success "node_modules existe"
        else
            print_warning "node_modules no existe. Ejecuta 'yarn install'"
        fi
        
        # Verificar app.json
        if [ -f "app.json" ]; then
            echo ""
            print_info "Configuración de Android en app.json:"
            grep -A 10 '"android"' app.json || print_warning "No se encontró configuración de Android"
        fi
        
        # Verificar variables de entorno
        if [ -f ".env" ]; then
            print_success ".env existe"
        else
            print_warning ".env no existe. Considera crear uno desde env.example"
        fi
        
        # Verificar EAS
        if [ -f "eas.json" ]; then
            print_success "eas.json existe"
        else
            print_warning "eas.json no existe. Considera crearlo desde eas.json.example"
        fi
        
        echo ""
        print_info "Verificación completada"
        ;;
        
    4)
        print_info "Saliendo..."
        exit 0
        ;;
        
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

echo ""
print_success "Proceso completado!"
echo ""

