/**
 * VisitCard Component
 * 
 * Componente para mostrar información de una visita individual
 * dentro de la ruta de visitas.
 * 
 * @module presentation/rutas/components/VisitCard
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { Visita, formatHora, formatDuracion, getPrioridadColors } from '@/core/rutas/interface/ruta';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

interface VisitCardProps {
  visita: Visita;
}

export const VisitCard: React.FC<VisitCardProps> = ({ visita }) => {
  const { t, locale } = useTranslation();
  const prioridadColors = getPrioridadColors(visita.prioridad);
  
  // Traducir prioridad
  const priorityKey = `routes.priorities.${visita.prioridad === 'alta' ? 'high' : visita.prioridad === 'media' ? 'medium' : 'low'}`;
  const priorityText = t(priorityKey);
  
  return (
    <View style={styles.card}>
      {/* Header con nombre del cliente y número de orden */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.clientName}>
            {visita.nombre_cliente}
          </ThemedText>
        </View>
        
        <View style={styles.headerRight}>
          {/* Badge de número de orden */}
          <View style={styles.orderBadge}>
            <ThemedText style={styles.orderText}>
              {visita.orden_en_ruta}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Información de la visita */}
      <View style={styles.content}>
        {/* Dirección */}
        {visita.direccion_cliente && (
          <View style={styles.infoRow}>
            <ThemedText style={styles.icon}>📍</ThemedText>
            <ThemedText style={styles.infoText}>
              {visita.direccion_cliente}
            </ThemedText>
          </View>
        )}

        {/* Horario */}
        <View style={styles.infoRow}>
          <ThemedText style={styles.icon}>🕐</ThemedText>
          <ThemedText style={styles.infoText}>
            {formatHora(visita.hora_inicio_sugerida)} - {formatHora(visita.hora_fin_sugerida)}
          </ThemedText>
        </View>

        {/* Duración */}
        <View style={styles.infoRow}>
          <ThemedText style={styles.icon}>⏱️</ThemedText>
          <ThemedText style={styles.infoText}>
            {t('routes.duration')}: {formatDuracion(visita.duracion_estimada_minutos, locale === 'es')}
          </ThemedText>
        </View>

        {/* Distancia y tiempo desde anterior (si existe) */}
        {visita.distancia_desde_anterior_km !== null && 
         visita.distancia_desde_anterior_km > 0 && (
          <View style={styles.infoRow}>
            <ThemedText style={styles.icon}>🚗</ThemedText>
            <ThemedText style={styles.infoText}>
              {visita.distancia_desde_anterior_km.toFixed(1)} km {t('routes.fromPrevious')}
              {visita.tiempo_viaje_desde_anterior_min && 
                ` (${formatDuracion(visita.tiempo_viaje_desde_anterior_min, locale === 'es')})`
              }
            </ThemedText>
          </View>
        )}
      </View>

      {/* Footer con prioridad */}
      <View style={styles.footer}>
        <View 
          style={[
            styles.priorityBadge,
            { backgroundColor: prioridadColors.bg }
          ]}
        >
          <ThemedText 
            style={[
              styles.priorityText,
              { color: prioridadColors.text }
            ]}
          >
            {t('routes.priorities.label')} {priorityText}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 149, 0, 0.05)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  orderBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

