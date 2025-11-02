import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import OrderCard from '@/presentation/theme/components/OrderCard';
import NewOrderModal from '@/presentation/theme/components/NewOrder';
import {
  getPedidosByClienteMock,
  getPedidosByGerenteMock,
} from '@/core/pedidos/api/pedidosApi';
import { Pedido } from '@/core/pedidos/interface/pedido';

const PedidosScreen = () => {
  const { user, hasRole } = useAuthStore();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const isGerenteCuenta = hasRole('gerente_cuenta');
  const isUsuarioInstitucional = hasRole('usuario_institucional');

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar pedidos
  const loadPedidos = useCallback(async () => {
    try {
      let response;

      if (isUsuarioInstitucional) {
        // Usuario institucional: solo sus pedidos
        const clienteId = parseInt(user?.id || '1');
        response = await getPedidosByClienteMock(clienteId);
        console.log(
          `✅ [PedidosScreen] Loaded ${response.pedidos.length} pedidos for cliente ${clienteId}`
        );
      } else if (isGerenteCuenta) {
        // Gerente: pedidos de todos sus clientes
        const gerenteId = parseInt(user?.id || '1');
        response = await getPedidosByGerenteMock(gerenteId);
        console.log(
          `✅ [PedidosScreen] Loaded ${response.pedidos.length} pedidos for gerente ${gerenteId}`
        );
      } else {
        // Sin rol específico
        response = { total: 0, page: 1, limit: 25, pedidos: [] };
      }

      setPedidos(response.pedidos);
    } catch (error) {
      console.error('❌ [PedidosScreen] Error loading pedidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isGerenteCuenta, isUsuarioInstitucional]);

  // Cargar al montar
  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  // Refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadPedidos();
  }, [loadPedidos]);

  // Manejar creación de pedido
  const handleOrderCreated = useCallback(
    (orderId: string, refNumber: string) => {
      console.log('✅ [PedidosScreen] Order created:', { orderId, refNumber });
      // Recargar lista
      loadPedidos();
    },
    [loadPedidos]
  );

  // Manejar click en pedido
  const handleOrderPress = useCallback((orderId: string) => {
    // TODO: Navegar a detalles del pedido
    console.log('📋 [PedidosScreen] Order pressed:', orderId);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>Cargando pedidos...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Mis Pedidos</ThemedText>
          <ThemedText style={styles.subtitle}>
            {user?.fullName || user?.email}
          </ThemedText>
        </View>
        <Pressable
          onPress={() => setIsModalOpen(true)}
          style={({ pressed }) => [
            styles.newOrderButton,
            {
              backgroundColor: primaryColor,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <ThemedText style={styles.newOrderText}>Nuevo</ThemedText>
        </Pressable>
      </View>

      {/* Lista de Pedidos */}
      {pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={textColor + '40'} />
          <ThemedText style={styles.emptyTitle}>No hay pedidos</ThemedText>
          <ThemedText style={styles.emptyText}>
            {isUsuarioInstitucional
              ? 'Crea tu primer pedido para comenzar'
              : 'Tus clientes aún no han creado pedidos'}
          </ThemedText>
          <Pressable
            onPress={() => setIsModalOpen(true)}
            style={({ pressed }) => [
              styles.emptyButton,
              {
                backgroundColor: primaryColor,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <ThemedText style={styles.emptyButtonText}>
              Crear Primer Pedido
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              order={{
                id: item.id,
                hospital: item.hospital,
                type: item.type,
                status: item.status,
                refNumber: item.refNumber,
                time: item.time,
                phone: item.phone,
                doctor: item.doctor,
                amount: item.amount,
                units: item.units,
                creationDate: item.creationDate,
                deliveryDate: item.deliveryDate,
              }}
              onPress={() => handleOrderPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={primaryColor}
            />
          }
        />
      )}

      {/* Modal de Nuevo Pedido */}
      <NewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOrderCreated={handleOrderCreated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  newOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newOrderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Espacio para BottomNav
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PedidosScreen;
