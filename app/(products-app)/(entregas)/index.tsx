import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const EntregasScreen = () => {
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
        <ThemedText style={styles.sectionTitle}>Seguimiento de Entregas</ThemedText>
        
        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>🚚 Entregas Pendientes</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Visualiza todas las entregas pendientes de tus pedidos
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>📦 En Tránsito</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Rastrea tus pedidos que están en camino a tu ubicación
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>✅ Entregas Completadas</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Revisa el historial de entregas completadas exitosamente
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>📍 Rastreo en Tiempo Real</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Ubicación en vivo del vehículo de entrega
          </ThemedText>
        </View>

        <View style={styles.featureCard}>
          <ThemedText style={styles.featureTitle}>🔔 Notificaciones</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Recibe alertas sobre el estado de tus entregas
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
    color: '#5856D6',
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
    backgroundColor: 'rgba(88, 86, 214, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#5856D6',
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

export default EntregasScreen;

