import ThemedButton from '@/presentation/theme/components/ThemedButton';
import ThemedLink from '@/presentation/theme/components/ThemedLink';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import ThemedTextInput from '@/presentation/theme/components/ThemedTextInput';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { useState } from 'react';
import {
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

  const onRegister = async () => {
    const { username, email, password, nit } = form;

    // === MOSTRAR CONFIGURACIÓN USANDO VARIABLES DE ENTORNO ===
    // logConfig(); // Función que muestra toda la configuración

    // === VALIDACIÓN DE CAMPOS ===
    console.log('=== DATOS DEL FORMULARIO ===');
    console.log({ username, email, password, nit });

    const hasEmptyFields = username.length === 0 || email.length === 0 || password.length === 0 || nit.length === 0;

    if (hasEmptyFields) {
      console.log('❌ Faltan campos por completar');
      return;
    }

    console.log('✅ Todos los campos están completos');
    console.log('📱 Plataforma:', Platform.OS);

    // === SIMULACIÓN DE REGISTRO ===
    console.log('=== SIMULANDO REGISTRO ===');
    console.log('📋 Datos a enviar:', { username, email, nit, password: '***' });

    // Aquí iría tu lógica de registro real
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
            onChangeText={(text) => setForm({ ...form, username: text })}
          />

          <ThemedTextInput
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />

          <ThemedTextInput
            placeholder="NIT - Número Identificación Tributario"
            keyboardType="numeric"
            autoCapitalize="none"
            icon="business-outline"
            value={form.nit}
            onChangeText={(text) => setForm({ ...form, nit: text })}
          />

          <ThemedTextInput
            placeholder="Contraseña"
            secureTextEntry
            autoCapitalize="none"
            icon="lock-closed-outline"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
          />
        </View>

        {/* Spacer */}
        <View style={{ marginTop: 10 }} />

        {/* Botón */}
        <ThemedButton
          icon="arrow-forward-outline"
          onPress={onRegister}
        >Crear cuenta
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
