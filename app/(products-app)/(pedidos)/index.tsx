import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import LogoutIconButton from '@/presentation/auth/components/LogoutIconButton';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

const PedidosScreen = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const { user } = useAuthStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText type="title">Gestión de Pedidos</ThemedText>
        <ThemedText style={styles.subtitle}>
          Bienvenido, {user?.fullName || user?.email}
        </ThemedText>
        <ThemedText style={styles.roleText}>
          Rol: {user?.roles?.join(', ') || 'Sin rol'}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.sectionTitle}>Funcionalidades de Usuario Institucional</ThemedText>
        
        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>🛒 Mis Pedidos</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Visualiza y gestiona todos tus pedidos realizados
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>➕ Nuevo Pedido</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Crea un nuevo pedido de productos médicos
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>📦 Estado de Pedidos</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Consulta el estado actual de tus pedidos en tiempo real
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>📋 Historial</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Revisa el historial completo de tus pedidos anteriores
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>💳 Facturación</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Accede a tus facturas y documentos de pago
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
    color: '#34C759',
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
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
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

export default PedidosScreen;
