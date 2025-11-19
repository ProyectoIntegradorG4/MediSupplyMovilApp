import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import React, { useCallback, useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Pressable, 
  RefreshControl, 
  ScrollView, 
  StyleSheet, 
  View 
} from 'react-native';
import { fetchRutaVisitasByUserId } from '@/core/rutas/actions/rutas-actions';
import { RutaDeVisitas, getFechaHoy, stringToDate, dateToString, formatDuracion } from '@/core/rutas/interface/ruta';
import { DateSelector } from '@/presentation/rutas/components/DateSelector';
import { VisitCard } from '@/presentation/rutas/components/VisitCard';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

const RutasScreen = () => {
  const { user } = useAuthStore();
  const { t, locale } = useTranslation();
  
  // Estados
  const [selectedDate, setSelectedDate] = useState<Date>(stringToDate(getFechaHoy()));
  const [rutaData, setRutaData] = useState<RutaDeVisitas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cargar ruta de visitas
  const loadRutaVisitas = useCallback(async (showLoader = true) => {
    if (!user?.id) {
      setError(t('routes.userNotAuthenticated'));
      return;
    }

    try {
      if (showLoader) {
        setIsLoading(true);
      }
      setError(null);

      const fecha = dateToString(selectedDate);
      console.log(`🔍 Cargando ruta para fecha: ${fecha}, usuario: ${user.id}`);
      
      const data = await fetchRutaVisitasByUserId(user.id, fecha);
      setRutaData(data);
      console.log(`✅ Ruta cargada: ${data.cantidad_visitas} visitas`);
    } catch (err: any) {
      console.error('❌ Error al cargar ruta:', err);
      setError(err.message || t('routes.errorLoadingRoute'));
      setRutaData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, selectedDate]);

  // Cargar ruta al montar y cuando cambie la fecha
  useEffect(() => {
    loadRutaVisitas();
  }, [loadRutaVisitas]);

  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRutaVisitas(false);
  };

  // Handle retry
  const handleRetry = () => {
    loadRutaVisitas();
  };

  // Validación de rol
  if (!user?.roles?.includes('gerente_cuenta')) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText style={styles.errorTitle}>⚠️ {t('routes.restrictedAccess')}</ThemedText>
        <ThemedText style={styles.errorMessage}>
          {t('routes.restrictedMessage')}
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#FF9500"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t('routes.title')}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {user?.fullName || user?.email}
        </ThemedText>
        <ThemedText style={styles.roleText}>
          {t('routes.accountManager')}
        </ThemedText>
      </View>

      {/* Date Selector */}
      <View style={styles.content}>
        <DateSelector 
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

        {/* Loading State */}
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FF9500" />
            <ThemedText style={styles.loadingText}>{t('routes.loadingRoute')}</ThemedText>
          </View>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorTitle}>❌ {t('common.error')}</ThemedText>
            <ThemedText style={styles.errorMessage}>{error}</ThemedText>
            <Pressable 
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryButtonPressed
              ]}
              onPress={handleRetry}
            >
              <ThemedText style={styles.retryButtonText}>{t('common.retry')}</ThemedText>
            </Pressable>
          </View>
        )}

        {/* No visits State */}
        {!isLoading && !error && rutaData && rutaData.cantidad_visitas === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>📅</ThemedText>
            <ThemedText style={styles.emptyTitle}>
              {t('routes.noVisitsTitle')}
            </ThemedText>
            <ThemedText style={styles.emptyMessage}>
              {t('routes.noVisitsMessage')}
            </ThemedText>
          </View>
        )}

        {/* Success State - Ruta con visitas */}
        {!isLoading && !error && rutaData && rutaData.cantidad_visitas > 0 && (
          <>
            {/* Resumen de la ruta */}
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryTitle}>{t('routes.summaryTitle')}</ThemedText>
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <ThemedText style={styles.summaryIcon}>📍</ThemedText>
                  <View>
                    <ThemedText style={styles.summaryLabel}>{t('routes.visits')}</ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {rutaData.cantidad_visitas}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.summaryItem}>
                  <ThemedText style={styles.summaryIcon}>⏱️</ThemedText>
                  <View>
                    <ThemedText style={styles.summaryLabel}>{t('routes.totalTime')}</ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {formatDuracion(rutaData.tiempo_total_minutos, locale === 'es')}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <ThemedText style={styles.summaryIcon}>🚗</ThemedText>
                  <View>
                    <ThemedText style={styles.summaryLabel}>{t('routes.distance')}</ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {rutaData.distancia_total_km.toFixed(1)} km
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.summaryItem}>
                  <ThemedText style={styles.summaryIcon}>🕐</ThemedText>
                  <View>
                    <ThemedText style={styles.summaryLabel}>{t('routes.schedule')}</ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {rutaData.hora_inicio_sugerida.substring(0, 5)} - {rutaData.hora_fin_sugerida.substring(0, 5)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>

            {/* Lista de visitas */}
            <View style={styles.visitsList}>
              <ThemedText style={styles.visitsTitle}>
                {t('routes.scheduledVisits')} ({rutaData.cantidad_visitas})
              </ThemedText>
              
              {rutaData.visitas
                .sort((a, b) => a.orden_en_ruta - b.orden_en_ruta)
                .map((visita) => (
                  <VisitCard key={visita.visita_id} visita={visita} />
                ))
              }
            </View>

            {/* Información adicional */}
            <View style={styles.infoCard}>
              <ThemedText style={styles.infoText}>
                💡 {t('routes.optimizedRoute', { version: rutaData.version_ruta })}
              </ThemedText>
              <ThemedText style={styles.infoSubtext}>
                {t('routes.origin', { origin: t(`routes.originTypes.${rutaData.origen_ruta}`) })}
              </ThemedText>
            </View>
          </>
        )}
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
    backgroundColor: 'rgba(255, 149, 0, 0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonPressed: {
    opacity: 0.7,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  summaryCard: {
    backgroundColor: 'rgba(46, 125, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7DFF',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  visitsList: {
    marginBottom: 24,
  },
  visitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 149, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default RutasScreen;

