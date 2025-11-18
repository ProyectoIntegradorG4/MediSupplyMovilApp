import { CONFIG } from '@/constants/config';
import { APIValidationError, formatUserServiceErrors, formatValidationErrors, registerUser, UserServiceError } from '@/core/auth/api/authApi';
import { mapFormToApiData, validateForm } from '@/helpers/validation';
import ThemedButton from '@/presentation/theme/components/ThemedButton';
import ThemedLink from '@/presentation/theme/components/ThemedLink';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import ThemedTextInput from '@/presentation/theme/components/ThemedTextInput';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';

const RegisterScreen = () => {
  const { height } = useWindowDimensions();
  const backgroundColor = useThemeColor({}, 'background');
  
  // Log de configuración para debugging
  console.log('🔧 CONFIG.API.GATEWAY_URL:', CONFIG.API.GATEWAY_URL);
  console.log('🔧 CONFIG.API.BASE_URL (deprecated):', CONFIG.API.BASE_URL);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    nit: '', // Campo NIT para clientes institucionales
  });

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onRegister = async () => {
    setIsLoading(true);
    setFieldErrors({});

    // === VALIDACIÓN COMPLETA DEL FORMULARIO ===
    const validation = validateForm(form);

    console.log('=== DATOS DEL FORMULARIO ===');
    console.log({ ...form, password: '***' });
    console.log('=== VALIDACIONES ===');
    console.log(validation);

    if (!validation.isValid) {
      // Mostrar errores específicos por campo
      const errors: Record<string, string> = {};
      Object.entries(validation.validations).forEach(([field, result]) => {
        if (!result.isValid) {
          errors[field] = result.message;
        }
      });

      setFieldErrors(errors);
      setIsLoading(false);

      // Mostrar alerta general
      Alert.alert(
        'Formulario incompleto',
        'Por favor corrige los errores marcados en el formulario',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    console.log('✅ Todos los campos son válidos');
    console.log('📱 Plataforma:', Platform.OS);

    // === REGISTRO REAL CON API ===
    try {
      // Convertir datos del formulario al formato de la API
      const apiData = mapFormToApiData(form);
      
      console.log('=== ENVIANDO REGISTRO A API ===');
      console.log('🌐 Gateway URL:', CONFIG.API.GATEWAY_URL);
      console.log('📋 Datos a enviar:', {
        ...apiData,
        password: '***' // No logear la contraseña
      });

      // Llamar a la API de registro
      const response = await registerUser(apiData);
      
      console.log('✅ Registro exitoso:', response);

      // Mostrar mensaje de éxito
      Alert.alert(
        '🎉 Registro exitoso',
        response.mensaje || `¡Bienvenido ${form.username}!\nTu cuenta institucional ha sido creada con el NIT ${form.nit}`,
        [{ text: 'Continuar', style: 'default' }]
      );

      // Limpiar formulario
      setForm({ username: '', email: '', password: '', nit: '' });

    } catch (error: any) {
      console.error('❌ Error al registrar:', error);
      
      try {
        if (error.response?.data) {
        const errorData = error.response.data;
        
        // Manejar errores del servicio de usuarios - puede venir en formato {"detail": {...}} o directo
        const userServiceError = errorData.detail || errorData;
        
        if (userServiceError.error && userServiceError.detalles) {
          const apiFieldErrors = formatUserServiceErrors(userServiceError);
          
          setFieldErrors(apiFieldErrors);
          
          // Mostrar mensaje específico según el tipo de error
          let alertTitle = 'Error de registro';
          let alertMessage = 'Por favor corrige los errores marcados en el formulario';
          
          switch (userServiceError.error) {
            case 'Reglas de negocio fallidas':
              alertTitle = 'Validación de datos';
              alertMessage = 'Los datos ingresados no cumplen con las reglas de negocio';
              break;
            case 'NIT no autorizado':
              alertTitle = 'NIT no válido';
              alertMessage = 'El NIT ingresado no está autorizado para registro';
              break;
            case 'Usuario ya existe':
              alertTitle = 'Usuario existente';
              alertMessage = 'Ya existe una cuenta con este correo electrónico';
              break;
            default:
              alertMessage = userServiceError.detalles?.message || alertMessage;
          }
          
          Alert.alert(alertTitle, alertMessage, [{ text: 'Entendido', style: 'default' }]);
        }
        // Manejar errores de validación de FastAPI (422)
        else if (error.response?.status === 422 && errorData.detail) {
          const validationError = errorData as APIValidationError;
          const apiFieldErrors = formatValidationErrors(validationError.detail);
          
          // Mapear errores de API a campos del formulario
          const mappedErrors: Record<string, string> = {};
          Object.entries(apiFieldErrors).forEach(([apiField, message]) => {
            // Mapear 'nombre' de la API a 'username' del formulario
            const formField = apiField === 'nombre' ? 'username' : apiField;
            mappedErrors[formField] = message;
          });
          
          setFieldErrors(mappedErrors);
          
          Alert.alert(
            'Errores de validación',
            'Por favor corrige los errores marcados en el formulario',
            [{ text: 'Entendido', style: 'default' }]
          );
        }
        else {
          // Otros errores con estructura diferente
          let errorMessage = 'Hubo un problema al crear tu cuenta. Por favor intenta nuevamente.';
          
          // Intentar extraer mensaje de error de diferentes estructuras posibles
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail && typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (errorData.detail && errorData.detail.message) {
            errorMessage = errorData.detail.message;
          }
          
          Alert.alert(
            'Error de registro',
            errorMessage,
            [{ text: 'Reintentar', style: 'default' }]
          );
        }
      } else {
        // Errores de red u otros errores sin respuesta
        let errorMessage = 'Hubo un problema de conexión. Por favor intenta nuevamente.';
        
        // Personalizar mensaje según el tipo de error
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
        } else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
          errorMessage = 'La conexión tardó demasiado. Por favor intenta nuevamente.';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        Alert.alert(
          'Error de conexión',
          errorMessage,
          [{ text: 'Reintentar', style: 'default' }]
        );
      }
      } catch (errorHandlingError) {
        // Si incluso el manejo de errores falla, mostrar un mensaje genérico
        console.error('❌ Error manejando el error:', errorHandlingError);
        Alert.alert(
          'Error',
          'Ocurrió un problema inesperado. Por favor intenta nuevamente.',
          [{ text: 'Entendido', style: 'default' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView
        style={{
          paddingHorizontal: 40,
          backgroundColor: backgroundColor,
        }}
      >
        <View
          style={{
            paddingTop: height * 0.15,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          {/* Logo de MediSupply */}
          <Image
            source={require('@/assets/images/LogoPrincipal.png')}
            style={{
              width: 280,
              height: 80,
              resizeMode: 'contain',
              marginBottom: 30,
            }}
          />

          <ThemedText type="title">Crear cuenta</ThemedText>
          <ThemedText style={{ color: 'grey', textAlign: 'center' }}>
            Por favor crea una cuenta para continuar
          </ThemedText>
        </View>

        {/* Campos del formulario */}
        <View style={{ marginTop: 20 }}>
          <ThemedTextInput
            placeholder="Nombre completo"
            autoCapitalize="words"
            icon="person-outline"
            value={form.username}
            onChangeText={(text) => {
              setForm({ ...form, username: text });
              // Limpiar error cuando el usuario empiece a escribir
              if (fieldErrors.username) {
                setFieldErrors({ ...fieldErrors, username: '' });
              }
            }}
            error={fieldErrors.username}
          />

          <ThemedTextInput
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            value={form.email}
            onChangeText={(text) => {
              setForm({ ...form, email: text });
              if (fieldErrors.email) {
                setFieldErrors({ ...fieldErrors, email: '' });
              }
            }}
            error={fieldErrors.email}
          />

          <ThemedTextInput
            placeholder="NIT - Número Identificación Tributario"
            keyboardType="numeric"
            autoCapitalize="none"
            icon="business-outline"
            value={form.nit}
            onChangeText={(text) => {
              setForm({ ...form, nit: text });
              if (fieldErrors.nit) {
                setFieldErrors({ ...fieldErrors, nit: '' });
              }
            }}
            error={fieldErrors.nit}
          />

          <ThemedTextInput
            placeholder="Contraseña"
            secureTextEntry
            autoCapitalize="none"
            icon="lock-closed-outline"
            value={form.password}
            onChangeText={(text) => {
              setForm({ ...form, password: text });
              if (fieldErrors.password) {
                setFieldErrors({ ...fieldErrors, password: '' });
              }
            }}
            error={fieldErrors.password}
          />
        </View>

        {/* Spacer */}
        <View style={{ marginTop: 10 }} />

        {/* Botón */}
        <ThemedButton
          icon={isLoading ? undefined : "arrow-forward-outline"}
          onPress={onRegister}
          disabled={isLoading}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </ThemedButton>

        {/* Spacer */}
        <View style={{ marginTop: 50 }} />

        {/* Enlace a registro */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ThemedText>¿Ya tienes cuenta?</ThemedText>
          <ThemedLink href="/auth/login" style={{ marginHorizontal: 5 }}>
            Ingresar
          </ThemedLink>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default RegisterScreen;
