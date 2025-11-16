/**
 * ARCHIVO DE EJEMPLO - Muestra cómo usar OrderCard y NewOrderModal
 * Este archivo puede ser usado como referencia en la implementación real
 */

import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import OrderCard from './OrderCard';
import NewOrderModal from './NewOrder';

// Datos de ejemplo
const SAMPLE_ORDERS = [
  {
    id: '1',
    hospital: 'Hospital Universitario San Ignacio',
    type: 'Hospital',
    status: 'pendiente' as const,
    refNumber: 'REF-2024-001',
    time: '10:30 AM',
    phone: '+57 300 123 4567',
    doctor: 'Dr. Juan Pérez',
    amount: '$2,500,000',
    units: '45 unidades',
    creationDate: '02/11/2024',
    deliveryDate: '05/11/2024',
  },
  {
    id: '2',
    hospital: 'Clínica Shaio',
    type: 'Clínica',
    status: 'enviado' as const,
    refNumber: 'REF-2024-002',
    time: '09:15 AM',
    phone: '+57 310 987 6543',
    doctor: 'Dra. María García',
    amount: '$1,800,000',
    units: '30 unidades',
    creationDate: '01/11/2024',
    deliveryDate: '04/11/2024',
  },
  {
    id: '3',
    hospital: 'Hospital El Country',
    type: 'Hospital',
    status: 'entregado' as const,
    refNumber: 'REF-2024-003',
    time: '02:45 PM',
    phone: '+57 320 456 7890',
    doctor: 'Dr. Carlos Rodríguez',
    amount: '$3,200,000',
    units: '60 unidades',
    creationDate: '28/10/2024',
    deliveryDate: '02/11/2024',
  },
];

export default function OrdersExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const handleOrderPress = (orderId: string) => {
    console.log('Orden seleccionada:', orderId);
    // Aquí puedes navegar a los detalles del pedido
  };

  const handleNewOrderSubmit = (formData: any) => {
    console.log('Nuevo pedido creado:', formData);
    // Aquí puedes enviar los datos al backend
  };

  return (
    <View style={styles.container}>
      {/* Header con botón de nuevo pedido */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Mis Pedidos</Text>
        <Pressable
          onPress={() => setIsModalOpen(true)}
          style={({ pressed }) => [
            styles.newOrderButton,
            { backgroundColor: primaryColor, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.newOrderText}>Nuevo Pedido</Text>
        </Pressable>
      </View>

      {/* Lista de pedidos */}
      <FlatList
        data={SAMPLE_ORDERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => handleOrderPress(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de nuevo pedido */}
      <NewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewOrderSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  listContent: {
    paddingBottom: 100, // Espacio para el BottomNav
  },
});

