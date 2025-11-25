/**
 * Pantalla de Lista de Visitas por Cliente
 * Muestra el historial de visitas de un cliente específico
 * 
 * @module app/(products-app)/(clientes)/[clienteId]/visits
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { ThemedView } from '@/presentation/theme/components/ThemedView';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';
import { fetchVisitsByClient } from '@/core/visits/actions/visits-actions';
import { fetchClienteDetail } from '@/core/clientes/actions/clientes-actions';
import { Visit, formatVisitDate, formatVisitTime } from '@/core/visits/interface/visit';
import { Cliente } from '@/core/clientes/interface/cliente';

const ClientVisitsScreen = () => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { clienteId } = useLocalSearchParams<{ clienteId: string }>();

  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clienteId) {
      loadData();
    }
  }, [clienteId]);

  const loadData = async () => {
    if (!clienteId) return;

    try {
      setLoading(true);
      setError(null);

      // Load cliente and visits in parallel
      const [clienteData, visitsData] = await Promise.all([
        fetchClienteDetail(parseInt(clienteId)),
        fetchVisitsByClient(parseInt(clienteId)),
      ]);

      setCliente(clienteData);
      setVisits(visitsData.items);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err instanceof Error ? err.message : t('visits.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleVisitPress = (visitId: number) => {
    router.push(`/(products-app)/(visits)/${visitId}`);
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>{t('visits.list.loading')}</ThemedText>
        </View>
      </ThemedView>
    );
  }

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
            tintColor={primaryColor}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {t('visits.list.title')}
          </ThemedText>
          {cliente && (
            <ThemedText style={styles.subtitle}>{cliente.nombre_comercial}</ThemedText>
          )}
          {/* Botón para agregar nueva visita */}
          <Pressable
            onPress={() => router.push(`/(products-app)/(clientes)/register-visit?clienteId=${clienteId}`)}
            style={[styles.addVisitButton, { backgroundColor: primaryColor }]}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <ThemedText style={styles.addVisitButtonText}>
              {t('visits.list.addNew')}
            </ThemedText>
          </Pressable>
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Pressable onPress={loadData} style={styles.retryButton}>
              <ThemedText style={styles.retryText}>{t('common.retry')}</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Visits List */}
        {!error && (
          <>
            {visits.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={textColor} style={{ opacity: 0.3 }} />
                <ThemedText style={styles.emptyText}>{t('visits.list.noVisits')}</ThemedText>
              </View>
            ) : (
              <View style={styles.visitsList}>
                {visits.map((visit) => (
                  <Pressable
                    key={visit.id}
                    onPress={() => handleVisitPress(visit.id)}
                    style={[styles.visitCard, { backgroundColor, borderColor }]}
                  >
                    <View style={styles.visitHeader}>
                      <View style={styles.visitDateContainer}>
                        <Ionicons name="calendar" size={20} color={primaryColor} />
                        <View style={styles.visitDateText}>
                          <ThemedText style={styles.visitDate}>
                            {formatVisitDate(visit.visit_datetime, locale)}
                          </ThemedText>
                          <ThemedText style={styles.visitTime}>
                            {formatVisitTime(visit.visit_datetime, locale)}
                          </ThemedText>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={textColor} />
                    </View>

                    {visit.tipo_visita && (
                      <View style={styles.visitInfo}>
                        <Ionicons name="briefcase" size={16} color={textColor} style={{ opacity: 0.7 }} />
                        <ThemedText style={styles.visitInfoText}>{visit.tipo_visita}</ThemedText>
                      </View>
                    )}

                    {visit.contacto_nombre && (
                      <View style={styles.visitInfo}>
                        <Ionicons name="person" size={16} color={textColor} style={{ opacity: 0.7 }} />
                        <ThemedText style={styles.visitInfoText}>{visit.contacto_nombre}</ThemedText>
                      </View>
                    )}

                    {visit.evidences.length > 0 && (
                      <View style={styles.visitInfo}>
                        <Ionicons name="images" size={16} color={textColor} style={{ opacity: 0.7 }} />
                        <ThemedText style={styles.visitInfoText}>
                          {visit.evidences.length} {visit.evidences.length === 1 ? 'evidencia' : 'evidencias'}
                        </ThemedText>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </>
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
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  addVisitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  addVisitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    opacity: 0.6,
  },
  visitsList: {
    paddingHorizontal: 20,
  },
  visitCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  visitDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  visitDateText: {
    flex: 1,
  },
  visitDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  visitTime: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  visitInfoText: {
    fontSize: 14,
    opacity: 0.8,
  },
});

export default ClientVisitsScreen;

