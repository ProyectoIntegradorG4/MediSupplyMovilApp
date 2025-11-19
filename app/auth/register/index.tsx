import { CONFIG } from '@/constants/config';
import { APIValidationError, formatUserServiceErrors, formatValidationErrors, registerUser, UserServiceError } from '@/core/auth/api/authApi';
import { mapFormToApiData, validateForm } from '@/helpers/validation';
import ThemedButton from '@/presentation/theme/components/ThemedButton';
import ThemedLink from '@/presentation/theme/components/ThemedLink';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import ThemedTextInput from '@/presentation/theme/components/ThemedTextInput';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';
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
  const { t } = useTranslation();
  
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
    const validation = validateForm(form, t);

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
        t('auth.register.validation.incompleteForm'),
        t('auth.register.validation.incompleteFormMessage'),
        [{ text: t('auth.register.validation.understood'), style: 'default' }]
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
        t('auth.register.success.title'),
        response.mensaje || t('auth.register.success.message', { username: form.username, nit: form.nit }),
        [{ text: t('auth.register.success.continue'), style: 'default' }]
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
          let alertTitle = t('auth.register.errors.registrationError');
          let alertMessage = t('auth.register.validation.incompleteFormMessage');
          
          switch (userServiceError.error) {
            case 'Reglas de negocio fallidas':
              alertTitle = t('auth.register.errors.dataValidation');
              alertMessage = t('auth.register.errors.dataValidationMessage');
              break;
            case 'NIT no autorizado':
              alertTitle = t('auth.register.errors.invalidNit');
              alertMessage = t('auth.register.errors.invalidNitMessage');
              break;
            case 'Usuario ya existe':
              alertTitle = t('auth.register.errors.userExists');
              alertMessage = t('auth.register.errors.userExistsMessage');
              break;
            default:
              alertMessage = userServiceError.detalles?.message || alertMessage;
          }
          
          Alert.alert(alertTitle, alertMessage, [{ text: t('auth.register.validation.understood'), style: 'default' }]);
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
            t('auth.register.errors.validationErrors'),
            t('auth.register.errors.validationErrorsMessage'),
            [{ text: t('auth.register.validation.understood'), style: 'default' }]
          );
        }
        else {
          // Otros errores con estructura diferente
          let errorMessage = t('auth.register.errors.genericError');
          
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
            t('auth.register.errors.registrationError'),
            errorMessage,
            [{ text: t('auth.register.errors.retry'), style: 'default' }]
          );
        }
      } else {
        // Errores de red u otros errores sin respuesta
        let errorMessage = t('auth.register.errors.genericError');
        
        // Personalizar mensaje según el tipo de error
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
          errorMessage = t('auth.register.errors.networkError');
        } else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
          errorMessage = t('auth.register.errors.timeoutError');
        } else if (error.message) {
          errorMessage = `${t('common.error')}: ${error.message}`;
        }
        
        Alert.alert(
          t('auth.register.errors.connectionError'),
          errorMessage,
          [{ text: t('auth.register.errors.retry'), style: 'default' }]
        );
      }
      } catch (errorHandlingError) {
        // Si incluso el manejo de errores falla, mostrar un mensaje genérico
        console.error('❌ Error manejando el error:', errorHandlingError);
        Alert.alert(
          t('common.error'),
          t('auth.register.errors.unexpectedError'),
          [{ text: t('auth.register.validation.understood'), style: 'default' }]
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

          <ThemedText type="title">{t('auth.register.title')}</ThemedText>
          <ThemedText style={{ color: 'grey', textAlign: 'center' }}>
            {t('auth.register.subtitle')}
          </ThemedText>
        </View>

        {/* Campos del formulario */}
        <View style={{ marginTop: 20 }}>
          <ThemedTextInput
            placeholder={t('auth.register.fullNamePlaceholder')}
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
            placeholder={t('auth.register.emailPlaceholder')}
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
            placeholder={t('auth.register.nitPlaceholder')}
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
            placeholder={t('auth.register.passwordPlaceholder')}
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
          {isLoading ? t('auth.register.creatingAccount') : t('auth.register.registerButton')}
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
          <ThemedText>{t('auth.register.hasAccount')}</ThemedText>
          <ThemedLink href="/auth/login" style={{ marginHorizontal: 5 }}>
            {t('auth.register.login')}
          </ThemedLink>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default RegisterScreen;
