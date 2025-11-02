import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type OrderStatus = 'pendiente' | 'enviado' | 'entregado' | 'cancelado';

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    pendiente: {
      backgroundColor: '#FFF3CD',
      textColor: '#856404',
      label: 'Pendiente',
    },
    enviado: {
      backgroundColor: '#D1ECF1',
      textColor: '#0C5460',
      label: 'Enviado',
    },
    entregado: {
      backgroundColor: '#D4EDDA',
      textColor: '#155724',
      label: 'Entregado',
    },
    cancelado: {
      backgroundColor: '#F8D7DA',
      textColor: '#721C24',
      label: 'Cancelado',
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
    paddingHorizontal: 24,
    paddingVertical: 2,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
});

