import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
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
      // Obtener entregas en todos los estados relevantes: programada, en_ruta, entregada, devuelta
      const estados = ['programada', 'en_ruta', 'entregada', 'devuelta'] as const;
      
      // Hacer llamadas en paralelo para cada estado
      const promesas = estados.map(estado => 
        getEntregasByNit(user.nit, { estado, limit: 50 }).catch(() => ({ entregas: [] }))
      );
      
      const resultados = await Promise.all(promesas);
      
      // Combinar todas las entregas y eliminar duplicados
      const todasEntregas = resultados.flatMap(r => r.entregas || []);
      const entregasUnicas = todasEntregas.filter((entrega, index, self) =>
        index === self.findIndex(e => e.entrega_id === entrega.entrega_id)
      );
      
      // Ordenar por fecha de programación (más recientes primero)
      entregasUnicas.sort((a, b) => {
        const fechaA = a.fecha_hora_programada ? new Date(a.fecha_hora_programada).getTime() : 0;
        const fechaB = b.fecha_hora_programada ? new Date(b.fecha_hora_programada).getTime() : 0;
        return fechaB - fechaA;
      });
      
      setEntregas(entregasUnicas);
    } catch (e) {
      console.error('Error cargando entregas:', e);
      setEntregas([]);
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
        <ThemedText style={styles.sectionTitle}>Estado de Entregas</ThemedText>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
            <ThemedText>Cargando entregas...</ThemedText>
          </View>
        ) : entregas.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No hay entregas disponibles</ThemedText>
          </View>
        ) : (
          <FlatList
            data={entregas}
            keyExtractor={(item) => item.entrega_id}
            renderItem={({ item }) => {
              const getEstadoColor = (estado: string) => {
                switch (estado?.toLowerCase()) {
                  case 'programada':
                    return '#5856D6'; // Azul
                  case 'en_ruta':
                    return '#FF9500'; // Naranja
                  case 'entregada':
                    return '#34C759'; // Verde
                  case 'devuelta':
                    return '#FF3B30'; // Rojo
                  default:
                    return '#8E8E93'; // Gris
                }
              };

              const getEstadoIcon = (estado: string) => {
                switch (estado?.toLowerCase()) {
                  case 'programada':
                    return '📅';
                  case 'en_ruta':
                    return '🚚';
                  case 'entregada':
                    return '✅';
                  case 'devuelta':
                    return '↩️';
                  default:
                    return '📦';
                }
              };

              const estadoColor = getEstadoColor(item.estado_entrega);
              const estadoIcon = getEstadoIcon(item.estado_entrega);
              const estadoLabel = item.estado_entrega?.toUpperCase().replace('_', ' ') || 'DESCONOCIDO';

              return (
                <View style={[styles.featureCard, { borderLeftColor: estadoColor }]}>
                  <View style={styles.cardHeader}>
                    <ThemedText style={styles.featureTitle}>
                      {estadoIcon} Pedido {item.pedido_id?.slice(0, 8) || 'N/A'}…
                    </ThemedText>
                    <View style={[styles.estadoBadge, { backgroundColor: `${estadoColor}20` }]}>
                      <ThemedText style={[styles.estadoText, { color: estadoColor }]}>
                        {estadoLabel}
                      </ThemedText>
                    </View>
                  </View>
                  {item.fecha_hora_programada && (
                    <ThemedText style={styles.featureDescription}>
                      📅 Programada: {new Date(item.fecha_hora_programada).toLocaleString('es-CO')}
                    </ThemedText>
                  )}
                  {item.fecha_hora_estimada_llegada && (
                    <ThemedText style={styles.featureDescription}>
                      ⏱️ ETA: {new Date(item.fecha_hora_estimada_llegada).toLocaleString('es-CO')}
                    </ThemedText>
                  )}
                  {item.fecha_hora_entrega_real && (
                    <ThemedText style={styles.featureDescription}>
                      ✅ Entregada: {new Date(item.fecha_hora_entrega_real).toLocaleString('es-CO')}
                    </ThemedText>
                  )}
                  {item.placa_vehiculo && (
                    <ThemedText style={styles.featureDescription}>
                      🚛 Vehículo: {item.placa_vehiculo}
                    </ThemedText>
                  )}
                </View>
              );
            }}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});

export default EntregasScreen;
