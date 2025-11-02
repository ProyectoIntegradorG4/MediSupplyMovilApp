import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { validateEmail } from '@/helpers/validation';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import ThemedButton from '@/presentation/theme/components/ThemedButton';
import ThemedLink from '@/presentation/theme/components/ThemedLink';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import ThemedTextInput from '@/presentation/theme/components/ThemedTextInput';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';

const LoginScreen = () => {
  const { login, getRoleBasedRoute } = useAuthStore();

  const { height } = useWindowDimensions();
  const backgroundColor = useThemeColor({}, 'background');

  const [isPosting, setIsPosting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onLogin = async () => {
    const { email, password } = form;

    console.log('🔐 Iniciando login con:', { email, password: '***' });

    // === VALIDACIÓN DE CAMPOS ===
    const errors: Record<string, string> = {};

    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }

    // Validar contraseña
    if (!password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (password.length === 0) {
      errors.password = 'La contraseña no puede estar vacía';
    }

    // Si hay errores, mostrarlos y detener
    if (Object.keys(errors).length > 0) {
      console.log('⚠️ Errores de validación:', errors);
      setFieldErrors(errors);

      Alert.alert(
        'Formulario incompleto',
        'Por favor corrige los errores marcados en el formulario',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    // Limpiar errores previos
    setFieldErrors({});

    setIsPosting(true);
    console.log('📡 Llamando a login...');
    const wasSuccessful = await login(email, password);
    console.log('✅ Login resultado:', wasSuccessful);
    setIsPosting(false);

    if (wasSuccessful) {
      const roleBasedRoute = getRoleBasedRoute() as any;
      console.log('🚀 Redirigiendo a:', roleBasedRoute);
      router.replace(roleBasedRoute);
      return;
    } else {
      console.log('❌ Login falló');
    }

    Alert.alert('Error', 'Usuario o contraseña no son correctos');
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
              width: 526,
              height: 100,
              resizeMode: 'contain',
              marginBottom: 30,
            }}
          />
          <ThemedText type="title">Ingresar</ThemedText>
          <ThemedText style={{ color: 'grey' }}>
            Por favor ingrese para continuar
          </ThemedText>
        </View>

        {/* Email y Password */}
        <View style={{ marginTop: 20 }}>
          <ThemedTextInput
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            value={form.email}
            onChangeText={(value) => {
              setForm({ ...form, email: value });
              // Limpiar error cuando el usuario empiece a escribir
              if (fieldErrors.email) {
                setFieldErrors({ ...fieldErrors, email: '' });
              }
            }}
            error={fieldErrors.email}
          />

          <ThemedTextInput
            placeholder="Contraseña"
            secureTextEntry
            autoCapitalize="none"
            icon="lock-closed-outline"
            value={form.password}
            onChangeText={(value) => {
              setForm({ ...form, password: value });
              // Limpiar error cuando el usuario empiece a escribir
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
          onPress={onLogin}
          disabled={isPosting}
        >
          Ingresar
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
          <ThemedText>¿No tienes cuenta?</ThemedText>
          <ThemedLink href="/auth/register" style={{ marginHorizontal: 5 }}>
            Crear cuenta
          </ThemedLink>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default LoginScreen;
