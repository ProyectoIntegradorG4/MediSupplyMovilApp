import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import ClientCard from '@/presentation/theme/components/ClientCard';
import SearchBar from '@/presentation/theme/components/SearchBar';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { ThemedView } from '@/presentation/theme/components/ThemedView';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchClientesDeGerente } from '@/core/clientes/actions/clientes-actions';
import { Cliente } from '@/core/clientes/interface/cliente';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

const ClientesScreen = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClientes();
  }, [user?.id]);

  /**
   * Carga los clientes asignados al gerente desde el backend
   */
  const loadClientes = async () => {
    if (!user?.id) {
      console.log('⚠️ No hay usuario autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const gerenteId = parseInt(user.id);
      console.log(`📋 Cargando clientes del gerente ${gerenteId}...`);

      const data = await fetchClientesDeGerente(gerenteId);
      
      console.log(`✅ ${data.total} clientes cargados`);
      setClientes(data.clientes);
    } catch (err) {
      console.error('❌ Error al cargar clientes:', err);
      setError(err instanceof Error ? err.message : t('clients.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recarga los clientes (pull to refresh)
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadClientes();
    setRefreshing(false);
  };

  /**
   * Filtrar clientes basado en la búsqueda local
   * Búsqueda en nombre, ciudad, dirección y contacto
   */
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre_comercial.toLowerCase().includes(searchText.toLowerCase()) ||
      cliente.razon_social.toLowerCase().includes(searchText.toLowerCase()) ||
      cliente.ciudad?.toLowerCase().includes(searchText.toLowerCase()) ||
      cliente.direccion?.toLowerCase().includes(searchText.toLowerCase()) ||
      cliente.contacto_principal?.toLowerCase().includes(searchText.toLowerCase()) ||
      cliente.tipo_institucion.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewVisits = (cliente: Cliente) => {
    console.log(`Ver visitas de: ${cliente.nombre_comercial}`);
    router.push(`/(products-app)/(clientes)/${cliente.cliente_id}/visits`);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t('clients.title')}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {user?.fullName || user?.email}
          </ThemedText>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder={t('clients.searchPlaceholder')}
            value={searchText}
            onChangeText={setSearchText}
            onSearch={setSearchText}
          />
        </View>

        {/* Estado de carga inicial */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.loadingText}>
              {t('clients.loadingClients')}
            </ThemedText>
          </View>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              {error}
            </ThemedText>
            <Pressable 
              onPress={loadClientes}
              style={styles.retryButton as any}
            >
              <ThemedText style={styles.retryText}>
                {t('common.retry')}
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* Contador de resultados */}
        {!loading && !error && (
          <View style={styles.resultCountContainer}>
            <ThemedText style={styles.resultCount}>
              {filteredClientes.length} {filteredClientes.length === 1 ? t('clients.resultsCount.client') : t('clients.resultsCount.clients')}
              {clientes.length !== filteredClientes.length && ` ${t('clients.resultsCount.of')} ${clientes.length} ${t('clients.resultsCount.total')}`}
            </ThemedText>
          </View>
        )}

        {/* Lista de clientes */}
        {!loading && !error && (
          <View style={styles.clientList}>
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => (
                <ClientCard
                  key={cliente.cliente_id}
                  cliente={cliente}
                  onRegisterVisit={() => handleViewVisits(cliente)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  {t('clients.empty.title')}
                </ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  {searchText 
                    ? t('clients.empty.withSearch')
                    : t('clients.empty.withoutSearch')}
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Espacio para el BottomNav
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultCountContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: '500',
  },
  clientList: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.6,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ClientesScreen;
