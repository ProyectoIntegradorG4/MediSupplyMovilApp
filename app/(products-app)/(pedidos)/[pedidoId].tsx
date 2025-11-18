import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Text } from 'react-native';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { getPedidoById, getPedidoHistorial } from '@/core/pedidos/api/pedidosApi';
import StatusBadge from '@/presentation/theme/components/StatusBadge';
import { formatDateTime, formatCurrency, formatNumber } from '@/helpers/i18n/formatting';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

export default function PedidoDetailScreen() {
  const { pedidoId } = useLocalSearchParams<{ pedidoId: string }>();
  const { t } = useTranslation();
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const bg = useThemeColor({}, 'background');

  const [isLoading, setIsLoading] = useState(true);
  const [pedido, setPedido] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [p, h] = await Promise.all([
          getPedidoById(String(pedidoId)),
          getPedidoHistorial(String(pedidoId)),
        ]);
        if (!mounted) return;
        setPedido(p);
        setHistorial(h?.historial || []);
      } catch (e) {
        // Silenciar por ahora
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [pedidoId]);

  const totalUnidades = useMemo(() => {
    return (pedido?.detalles || []).reduce((acc: number, d: any) => acc + (d.cantidad_solicitada || 0), 0);
  }, [pedido]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText>{t('orders.loadingOrder')}</ThemedText>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ThemedText>{t('orders.detail.notFound')}</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t('orders.detail.order')} {pedido.numero_pedido}</ThemedText>
        <StatusBadge status={pedido.estado} />
      </View>

      <View style={styles.sectionCard}>
        <ThemedText style={styles.sectionTitle}>{t('orders.detail.summary')}</ThemedText>
        <Text style={[styles.itemText, { color: textColor }]}>{t('orders.detail.nit')} {pedido.nit}</Text>
        <Text style={[styles.itemText, { color: textColor }]}>{t('orders.detail.created')} {formatDateTime(pedido.fecha_creacion)}</Text>
        <Text style={[styles.itemText, { color: textColor }]}>{t('orders.detail.total')} {formatCurrency(pedido.monto_total || 0)}</Text>
        <Text style={[styles.itemText, { color: textColor }]}>{t('orders.detail.units')} {totalUnidades}</Text>
      </View>

      <View style={styles.sectionCard}>
        <ThemedText style={styles.sectionTitle}>{t('orders.detail.products')}</ThemedText>
        {(pedido.detalles || []).map((d: any) => (
          <View key={d.detalle_id} style={styles.itemRow}>
            <Text style={[styles.itemName, { color: textColor }]} numberOfLines={2}>{d.nombre_producto}</Text>
            <Text style={[styles.itemMeta, { color: textColor }]}>
              {d.cantidad_solicitada} x {formatCurrency(d.precio_unitario || 0)} = {formatCurrency(d.subtotal || 0)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <ThemedText style={styles.sectionTitle}>{t('orders.detail.statusHistory')}</ThemedText>
        {historial.length === 0 ? (
          <ThemedText>{t('orders.detail.noChanges')}</ThemedText>
        ) : (
          historial.map((h, idx) => (
            <View key={idx} style={styles.historyRow}>
              <View style={styles.historyDot} />
              <View style={styles.historyContent}>
                <Text style={[styles.historyState, { color: textColor }]}>
                  {h.estado_anterior} → {h.estado_nuevo}
                </Text>
                <Text style={[styles.historyTime, { color: textColor }]}>
                  {formatDateTime(h.fecha_cambio)}
                </Text>
                {!!h.comentario && (
                  <Text style={[styles.historyComment, { color: textColor }]}>{h.comentario}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionCard: {
    margin: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemRow: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: 14,
    opacity: 0.7,
  },
  historyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5856D6',
    marginTop: 6,
  },
  historyContent: {
    flex: 1,
  },
  historyState: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyTime: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  historyComment: {
    fontSize: 12,
    marginTop: 4,
  },
});


