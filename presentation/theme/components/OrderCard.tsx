import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import StatusBadge from './StatusBadge';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

type OrderStatus = 'pendiente' | 'enviado' | 'entregado' | 'cancelado';

interface Order {
  id: string;
  hospital: string;
  type: string;
  status: OrderStatus;
  refNumber: string;
  time: string;
  phone: string;
  doctor: string;
  amount: string;
  units: string;
  creationDate: string;
  deliveryDate: string;
}

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: primaryColor + '0D', opacity: pressed ? 0.8 : 1 },
      ]}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={[styles.hospitalName, { color: textColor }]} numberOfLines={2}>
          {order.hospital}
        </Text>
        <View style={styles.badges}>
          <View style={[styles.typeBadge, { backgroundColor, borderColor: '#D9D9D9' }]}>
            <Text style={[styles.typeText, { color: primaryColor }]}>
              {order.type}
            </Text>
          </View>
          <StatusBadge status={order.status} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          <View style={styles.infoRow}>
            <Ionicons name="barcode-outline" size={20} color={textColor} style={styles.icon} />
            <Text style={[styles.refNumber, { color: textColor }]} numberOfLines={1}>
              {order.refNumber}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={textColor} style={styles.icon} />
            <Text style={[styles.infoText, { color: textColor }]}>{order.time}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={textColor} style={styles.icon} />
            <Text style={[styles.infoText, { color: textColor }]}>{order.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={textColor} style={styles.icon} />
            <Text style={[styles.infoText, { color: textColor }]} numberOfLines={1}>
              {order.doctor}
            </Text>
          </View>
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          <View style={styles.dateSection}>
            <Ionicons name="calendar-outline" size={20} color={textColor} style={styles.icon} />
            <View style={styles.dateContent}>
              <Text style={[styles.dateLabel, { color: textColor }]}>{t('orders.card.creationDate')}</Text>
              <Text style={[styles.dateValue, { color: textColor }]}>{order.creationDate}</Text>
            </View>
          </View>

          <View style={styles.dateSection}>
            <Ionicons name="timer-outline" size={20} color={textColor} style={styles.icon} />
            <View style={styles.dateContent}>
              <Text style={[styles.dateLabel, { color: textColor }]}>{t('orders.card.deliveryDate')}</Text>
              <Text style={[styles.dateValue, { color: textColor }]}>{order.deliveryDate}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { borderColor: textColor }]} />

      {/* Footer Section */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="cash-outline" size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.amountText, { color: textColor }]}>{order.amount}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="clipboard-outline" size={20} color={textColor} style={styles.icon} />
          <Text style={[styles.unitsText, { color: textColor }]}>{order.units}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  hospitalName: {
    fontSize: 25,
    fontWeight: '400',
    lineHeight: 28,
    flex: 1,
  },
  badges: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 32,
    paddingVertical: 2,
    borderRadius: 16,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  mainContent: {
    flexDirection: 'row',
    gap: 8,
  },
  leftColumn: {
    flex: 1,
    gap: 6,
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 20,
    height: 20,
  },
  refNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 20,
    flex: 1,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    lineHeight: 20,
  },
  dateValue: {
    fontSize: 16,
    lineHeight: 20,
  },
  divider: {
    borderTopWidth: 1,
    width: '100%',
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
  },
  footerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  unitsText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
});
