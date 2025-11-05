import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { PedidoItem, calculateItemSubtotal, formatAmount } from '@/core/pedidos/interface/pedido';

interface ShoppingCartProps {
  items: PedidoItem[];
  onUpdateQuantity: (sku: string, newQuantity: number) => void;
  onRemoveItem: (sku: string) => void;
  onStockValidationError?: (message: string) => void;
  productStockMap?: Map<string, number>; // SKU -> stock disponible
}

export default function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onStockValidationError,
  productStockMap,
}: ShoppingCartProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // Calcular totales
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateItemSubtotal(item);
  }, 0);

  // Calcular total (puede agregar impuestos aquí si aplica)
  const total = subtotal;

  // Manejar cambio de cantidad
  const handleQuantityChange = (sku: string, text: string) => {
    const newQuantity = parseInt(text) || 0;

    // Obtener stock disponible si está disponible
    if (productStockMap) {
      const availableStock = productStockMap.get(sku);
      if (availableStock !== undefined) {
        if (newQuantity > availableStock) {
          if (onStockValidationError) {
            onStockValidationError(`Stock insuficiente. Disponible: ${availableStock} unidades`);
          }
          // Ajustar a stock máximo
          if (availableStock > 0) {
            onUpdateQuantity(sku, availableStock);
          }
          return;
        }

        if (newQuantity === 0) {
          onRemoveItem(sku);
          return;
        }
      }
    }

    if (newQuantity === 0) {
      onRemoveItem(sku);
      return;
    }

    onUpdateQuantity(sku, newQuantity);
  };

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: primaryColor + '0D' }]}>
        <Ionicons name="cart-outline" size={48} color={textColor + '60'} />
        <Text style={[styles.emptyText, { color: textColor }]}>
          El carrito está vacío
        </Text>
        <Text style={[styles.emptySubtext, { color: textColor }]}>
          Agrega productos para continuar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: textColor + '20' }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Resumen del Pedido
        </Text>
        <View style={[styles.itemsBadge, { backgroundColor: primaryColor }]}>
          <Text style={styles.itemsBadgeText}>{items.length}</Text>
        </View>
      </View>

      {/* Items List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.sku}
        renderItem={({ item }) => {
          const availableStock = productStockMap?.get(item.sku);
          const itemSubtotal = calculateItemSubtotal(item);

          return (
            <View style={[styles.itemCard, { backgroundColor: primaryColor + '0D' }]}>
              {/* Product Info */}
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: textColor }]} numberOfLines={2}>
                  {item.nombre}
                </Text>
                <Text style={[styles.itemSku, { color: textColor + '80' }]}>
                  SKU: {item.sku}
                </Text>
                <Text style={[styles.itemPrice, { color: textColor }]}>
                  {formatAmount(item.precio)} c/u
                </Text>
              </View>

              {/* Quantity Controls */}
              <View style={styles.quantityControls}>
                <Text style={[styles.quantityLabel, { color: textColor }]}>
                  Cantidad
                </Text>
                <TextInput
                  value={item.cantidad.toString()}
                  onChangeText={(text) => handleQuantityChange(item.sku, text)}
                  keyboardType="numeric"
                  maxLength={4}
                  style={[
                    styles.quantityInput,
                    {
                      color: textColor,
                      backgroundColor,
                      borderColor: textColor + '40',
                    },
                  ]}
                />
                {availableStock !== undefined && (
                  <Text style={[styles.stockInfo, { color: textColor + '80' }]}>
                    Stock: {availableStock}
                  </Text>
                )}
              </View>

              {/* Subtotal and Remove */}
              <View style={styles.itemActions}>
                <Text style={[styles.itemSubtotal, { color: textColor }]}>
                  {formatAmount(itemSubtotal)}
                </Text>
                <Pressable
                  onPress={() => onRemoveItem(item.sku)}
                  style={({ pressed }) => [
                    styles.removeButton,
                    { backgroundColor: '#dc3545', opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                </Pressable>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Totals Section */}
      <View style={[styles.totalsSection, { borderTopColor: textColor + '20' }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: textColor }]}>Subtotal:</Text>
          <Text style={[styles.totalValue, { color: textColor }]}>
            {formatAmount(subtotal)}
          </Text>
        </View>
        {/* Aquí se pueden agregar impuestos si aplica */}
        <View style={[styles.totalRow, styles.totalRowFinal]}>
          <Text style={[styles.totalLabelFinal, { color: textColor }]}>Total:</Text>
          <Text style={[styles.totalValueFinal, { color: primaryColor }]}>
            {formatAmount(total)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemsBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSku: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityControls: {
    alignItems: 'center',
    gap: 4,
    minWidth: 80,
  },
  quantityLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  quantityInput: {
    width: 60,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockInfo: {
    fontSize: 10,
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  itemSubtotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalsSection: {
    padding: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRowFinal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  totalLabel: {
    fontSize: 16,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalLabelFinal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalValueFinal: {
    fontSize: 24,
    fontWeight: '900',
  },
});

