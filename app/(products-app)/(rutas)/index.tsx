import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const RutasScreen = () => {
  const { user } = useAuthStore();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <ThemedText style={styles.subtitle}>
          Bienvenido, {user?.fullName || user?.email}
        </ThemedText>
        <ThemedText style={styles.roleText}>
          Rol: {user?.roles?.join(', ') || 'Sin rol'}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.sectionTitle}>Gestión de Rutas de Entrega</ThemedText>
        
        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>🗺️ Planificación de Rutas</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Planifica y optimiza las rutas de entrega para tus clientes
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>📍 Rutas Activas</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Visualiza las rutas de entrega activas en tiempo real
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>🚚 Asignación de Vehículos</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Asigna vehículos y conductores a las rutas de entrega
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>📊 Historial de Rutas</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Consulta el historial completo de rutas completadas
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
  scrollContent: {
    paddingBottom: 100, // Espacio para el BottomNav
  },
  header: {
    padding: 20,
    paddingTop: 16,
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
    color: '#FF9500',
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
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
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

export default RutasScreen;

