import { validateForm } from '@/helpers/validation';
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

    // Aquí lógica de registro real
    /*
    try {
      const response = await fetch(`${CONFIG.API.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, nit }),
      });
      
      const result = await response.json();
      console.log('✅ Registro exitoso:', result);
    } catch (error) {
      console.error('❌ Error al registrar:', error);
    }
    */

    // === SIMULACIÓN DE REGISTRO ===
    try {
      console.log('=== SIMULANDO REGISTRO ===');
      console.log('📋 Datos a enviar:', {
        username: form.username,
        email: form.email,
        nit: form.nit,
        password: '***'
      });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular éxito
      Alert.alert(
        '🎉 Registro exitoso',
        `Bienvenido ${form.username}!\nTu cuenta institucional ha sido creada con el NIT ${form.nit}`,
        [{ text: 'Continuar', style: 'default' }]
      );

      // Limpiar formulario
      setForm({ username: '', email: '', password: '', nit: '' });

    } catch (error) {
      console.error('❌ Error al registrar:', error);
      Alert.alert(
        'Error de registro',
        'Hubo un problema al crear tu cuenta. Por favor intenta nuevamente.',
        [{ text: 'Reintentar', style: 'default' }]
      );
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
          icon="arrow-forward-outline"
          onPress={onRegister}
        >
          Crear cuenta
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
