import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import LogoutIconButton from '@/presentation/auth/components/LogoutIconButton';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

const ClientesScreen = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const { user } = useAuthStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText type="title">Gestión de Clientes</ThemedText>
        <ThemedText style={styles.subtitle}>
          Bienvenido, {user?.fullName || user?.email}
        </ThemedText>
        <ThemedText style={styles.roleText}>
          Rol: {user?.roles?.join(', ') || 'Sin rol'}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.sectionTitle}>Funcionalidades de Gerente de Cuenta</ThemedText>
        
        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>📋 Lista de Clientes</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Gestiona y visualiza todos los clientes institucionales registrados
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>➕ Nuevo Cliente</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Registra nuevos clientes institucionales en el sistema
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>📊 Reportes</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Genera reportes de clientes y estadísticas de ventas
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>⚙️ Configuración</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Configura parámetros y preferencias del sistema
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.7,
  },
  roleText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});

export default ClientesScreen;
