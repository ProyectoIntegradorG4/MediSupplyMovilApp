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
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

const LoginScreen = () => {
  const { login, getRoleBasedRoute } = useAuthStore();
  const { t } = useTranslation();

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
    const emailValidation = validateEmail(email, t);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }

    // Validar contraseña
    if (!password) {
      errors.password = t('auth.login.validation.passwordRequired');
    } else if (password.length === 0) {
      errors.password = t('auth.login.validation.passwordEmpty');
    }

    // Si hay errores, mostrarlos y detener
    if (Object.keys(errors).length > 0) {
      console.log('⚠️ Errores de validación:', errors);
      setFieldErrors(errors);

      Alert.alert(
        t('auth.login.errors.incompleteForm'),
        t('auth.login.errors.incompleteFormMessage'),
        [{ text: t('auth.login.errors.understood'), style: 'default' }]
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

    Alert.alert(t('common.error'), t('auth.login.errors.invalidCredentials'));
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
          <ThemedText type="title">{t('auth.login.title')}</ThemedText>
          <ThemedText style={{ color: 'grey' }}>
            {t('auth.login.subtitle')}
          </ThemedText>
        </View>

        {/* Email y Password */}
        <View style={{ marginTop: 20 }}>
          <ThemedTextInput
            placeholder={t('auth.login.emailPlaceholder')}
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
            placeholder={t('auth.login.passwordPlaceholder')}
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
          {t('auth.login.loginButton')}
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
          <ThemedText>{t('auth.login.noAccount')}</ThemedText>
          <ThemedLink href="/auth/register" style={{ marginHorizontal: 5 }}>
            {t('auth.login.createAccount')}
          </ThemedLink>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default LoginScreen;
