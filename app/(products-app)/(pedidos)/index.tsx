import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import OrderCard from '@/presentation/theme/components/OrderCard';
import NewOrderModal from '@/presentation/theme/components/NewOrder';
import {
  getPedidosByClienteMock,
  getPedidosByGerenteMock,
  getClientesGerenteMock,
} from '@/core/pedidos/api/pedidosApi';
import { Pedido } from '@/core/pedidos/interface/pedido';
import { Cliente } from '@/core/clientes/interface/cliente';

const PedidosScreen = () => {
  const { user, hasRole } = useAuthStore();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const isGerenteCuenta = hasRole('gerente_cuenta');
  const isUsuarioInstitucional = hasRole('usuario_institucional');

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Para gerente_cuenta: filtro de clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedClienteNit, setSelectedClienteNit] = useState<string>('');
  const [showClientePicker, setShowClientePicker] = useState(false);

  // Cargar clientes del gerente
  const loadClientes = useCallback(async () => {
    if (!isGerenteCuenta) return;
    
    try {
      const gerenteId = parseInt(user?.id || '1');
      const clientesList = await getClientesGerenteMock(gerenteId);
      setClientes(clientesList);
      console.log(`✅ [PedidosScreen] Loaded ${clientesList.length} clientes for gerente ${gerenteId}`);
    } catch (error) {
      console.error('❌ [PedidosScreen] Error loading clientes:', error);
    }
  }, [user, isGerenteCuenta]);
  
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
        // Gerente: pedidos de todos sus clientes o filtrados por NIT
        const gerenteId = parseInt(user?.id || '1');
        const filters = selectedClienteNit ? { nit: selectedClienteNit } : {};
        response = await getPedidosByGerenteMock(gerenteId, filters);
        console.log(
          `✅ [PedidosScreen] Loaded ${response.pedidos.length} pedidos for gerente ${gerenteId}${selectedClienteNit ? ` (NIT: ${selectedClienteNit})` : ''}`
        );
      } else {
        // Sin rol específico
        response = { total: 0, page: 1, limit: 25, pedidos: [] };
      }

      // Enriquecer con datos de cliente (nombre/contacto) si están disponibles
      const pedidosBase: Pedido[] = response.pedidos;

      if (isGerenteCuenta && clientes.length > 0) {
        const nitToCliente = new Map<string, Cliente>();
        clientes.forEach(c => nitToCliente.set(c.nit, c));

        const enriched = pedidosBase.map((p) => {
          const cliente = nitToCliente.get(p.hospital);
          if (cliente) {
            return {
              ...p,
              hospital: cliente.nombre_comercial || p.hospital,
              phone: cliente.telefono || p.phone,
              doctor: cliente.contacto_principal || p.doctor,
            };
          }
          return p;
        });
        setPedidos(enriched);
      } else {
        setPedidos(pedidosBase);
      }
    } catch (error) {
      console.error('❌ [PedidosScreen] Error loading pedidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isGerenteCuenta, isUsuarioInstitucional, selectedClienteNit, clientes]);

  // Cargar clientes al montar (solo gerente)
  useEffect(() => {
    if (isGerenteCuenta) {
      loadClientes();
    }
  }, [isGerenteCuenta, loadClientes]);
  
  // Cargar pedidos al montar o cuando cambie el filtro
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
    router.push(`/(products-app)/(pedidos)/${orderId}`);
  }, [router]);

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
        <View style={{ flex: 1 }}>
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
      
      {/* Filtro de clientes para gerente_cuenta */}
      {isGerenteCuenta && clientes.length > 0 && (
        <View style={styles.filterContainer}>
          <ThemedText style={styles.filterLabel}>Filtrar por cliente:</ThemedText>
          <TouchableOpacity
            style={[styles.pickerButton, { borderColor: primaryColor }]}
            onPress={() => setShowClientePicker(!showClientePicker)}
          >
            <ThemedText style={styles.pickerButtonText}>
              {selectedClienteNit 
                ? clientes.find(c => c.nit === selectedClienteNit)?.nombre_comercial || 'Seleccionar cliente'
                : 'Todos los clientes'}
            </ThemedText>
            <Ionicons 
              name={showClientePicker ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={textColor} 
            />
          </TouchableOpacity>
          
          {showClientePicker && (
            <View style={styles.pickerDropdown}>
              <ScrollView style={styles.pickerScroll}>
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    selectedClienteNit === '' && { backgroundColor: primaryColor + '20' }
                  ]}
                  onPress={() => {
                    setSelectedClienteNit('');
                    setShowClientePicker(false);
                  }}
                >
                  <ThemedText style={styles.pickerItemText}>Todos los clientes</ThemedText>
                </TouchableOpacity>
                {clientes.map((cliente) => (
                  <TouchableOpacity
                    key={cliente.cliente_id}
                    style={[
                      styles.pickerItem,
                      selectedClienteNit === cliente.nit && { backgroundColor: primaryColor + '20' }
                    ]}
                    onPress={() => {
                      setSelectedClienteNit(cliente.nit);
                      setShowClientePicker(false);
                    }}
                  >
                    <ThemedText style={styles.pickerItemText}>
                      {cliente.nombre_comercial}
                    </ThemedText>
                    <ThemedText style={styles.pickerItemSubtext}>
                      NIT: {cliente.nit}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
  },
  pickerDropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    marginTop: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  pickerItemSubtext: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
});

export default PedidosScreen;
