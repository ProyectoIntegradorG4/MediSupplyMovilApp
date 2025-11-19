import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { Fonts, BorderRadius, Spacing, FontSizes } from '@/constants/theme';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

type OrderStatus = 'pendiente' | 'enviado' | 'entregado' | 'cancelado';

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const badgePendingBg = useThemeColor({}, 'badgePendingBg');
  const badgePendingText = useThemeColor({}, 'badgePendingText');
  const badgeSentBg = useThemeColor({}, 'badgeSentBg');
  const badgeSentText = useThemeColor({}, 'badgeSentText');
  const badgeDeliveredBg = useThemeColor({}, 'badgeDeliveredBg');
  const badgeDeliveredText = useThemeColor({}, 'badgeDeliveredText');
  const badgeCancelledBg = useThemeColor({}, 'badgeCancelledBg');
  const badgeCancelledText = useThemeColor({}, 'badgeCancelledText');

  const statusConfig = {
    pendiente: {
      backgroundColor: badgePendingBg,
      textColor: badgePendingText,
      label: t('orders.status.pendiente'),
    },
    enviado: {
      backgroundColor: badgeSentBg,
      textColor: badgeSentText,
      label: t('orders.status.enviado'),
    },
    entregado: {
      backgroundColor: badgeDeliveredBg,
      textColor: badgeDeliveredText,
      label: t('orders.status.entregado'),
    },
    cancelado: {
      backgroundColor: badgeCancelledBg,
      textColor: badgeCancelledText,
      label: t('orders.status.cancelado'),
    },
  };

  const config = statusConfig[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.text, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    lineHeight: 24,
    fontFamily: Fonts.regular,
  },
});

