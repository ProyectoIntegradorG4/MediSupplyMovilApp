import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { getEntregasByNit } from '@/core/pedidos/api/pedidosApi';

const EntregasScreen = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [entregas, setEntregas] = useState<any[]>([]);

  const loadEntregas = useCallback(async () => {
    if (!user?.nit) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await getEntregasByNit(user.nit, { estado: 'programada' });
      setEntregas(data.entregas || []);
    } catch (e) {
      // Silenciar error temporalmente en pantalla inicial
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.nit]);

  useEffect(() => {
    loadEntregas();
  }, [loadEntregas]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadEntregas();
  }, [loadEntregas]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.subtitle}>
          Bienvenido, {user?.fullName || user?.email}
        </ThemedText>
        <ThemedText style={styles.roleText}>
          Rol: {user?.roles?.join(', ') || 'Sin rol'}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.sectionTitle}>Entregas Programadas</ThemedText>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
            <ThemedText>Cargando entregas...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={entregas}
            keyExtractor={(item) => item.entrega_id}
            renderItem={({ item }) => (
              <View style={styles.featureCard}>
                <ThemedText style={styles.featureTitle}>🚚 Pedido {item.pedido_id.slice(0, 8)}…</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Estado: {item.estado_entrega}
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Programada: {item.fecha_hora_programada ? new Date(item.fecha_hora_programada).toLocaleString() : 'N/D'}
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  ETA: {item.fecha_hora_estimada_llegada ? new Date(item.fecha_hora_estimada_llegada).toLocaleString() : 'N/D'}
                </ThemedText>
              </View>
            )}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </View>
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
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
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
