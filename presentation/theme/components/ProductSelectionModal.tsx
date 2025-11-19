import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

// Tipo para productos (compatible con API)
interface Product {
  productoId: string;
  nombre: string;
  sku: string;
  precio: number;
  stock: number;
  stockStatus: 'available' | 'low' | 'medium';
  fechaVencimiento: string;
  ubicacion: string;
  categoria?: string;
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (sku: string, cantidad: number) => void;
  products: Product[];
  isLoading?: boolean;
}

// Hook para debounce
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onAddToCart,
  products,
  isLoading = false,
}: ProductSelectionModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // Debounce de búsqueda (500ms para respuesta < 2s según HU)
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Filtrar productos según búsqueda
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return products;
    }

    const query = debouncedSearch.toLowerCase();
    return products.filter(
      (product) =>
        product.nombre.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.categoria?.toLowerCase().includes(query)
    );
  }, [products, debouncedSearch]);

  // Callback para agregar al carrito con validación
  const handleAddToCart = useCallback(
    (sku: string, cantidad: number) => {
      const product = products.find((p) => p.sku === sku);

      if (!product) {
        Alert.alert(t('common.error'), t('orders.newOrder.errors.productNotFound'));
        return;
      }

      // Validación de stock
      if (product.stock === 0) {
        Alert.alert(t('orders.newOrder.errors.insufficientStock'), t('components.productCard.errors.noStock'));
        return;
      }

      if (cantidad > product.stock) {
        Alert.alert(
          t('orders.newOrder.errors.insufficientStock'),
          t('components.productCard.errors.insufficientStock', { stock: product.stock })
        );
        return;
      }

      // Agregar al carrito
      onAddToCart(sku, cantidad);
      
      // Marcar como seleccionado
      setSelectedProducts((prev) => new Set(prev).add(sku));
    },
    [products, onAddToCart]
  );

  // Callback para errores de validación de stock
  const handleStockValidationError = useCallback((message: string) => {
    Alert.alert(t('orders.newOrder.errors.insufficientStock'), message);
  }, [t]);

  // Formatear precio
  const formatPrice = (precio: number): string => {
    return `$${precio.toLocaleString('es-CO')}`;
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: primaryColor + '20' }]}>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              {t('components.productSelector.title')}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: textColor, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close" size={24} color={backgroundColor} />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
              placeholder={t('components.productSelector.searchPlaceholder')}
              onChangeText={setSearchQuery}
              value={searchQuery}
              autoCapitalize="none"
            />
            {debouncedSearch && (
              <Text style={[styles.resultsCount, { color: textColor }]}>
                {filteredProducts.length} {filteredProducts.length !== 1 ? t('components.productSelector.resultsPlural') : t('components.productSelector.results')}
              </Text>
            )}
          </View>

          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={primaryColor} />
              <Text style={[styles.loadingText, { color: textColor }]}>
                {t('components.productSelector.loading')}
              </Text>
            </View>
          ) : (
            /* Products List */
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.productoId}
              renderItem={({ item }) => {
                const isSelected = selectedProducts.has(item.sku);
                return (
                  <ProductCard
                    name={item.nombre}
                    sku={item.sku}
                    price={formatPrice(item.precio)}
                    stock={item.stock}
                    stockStatus={item.stockStatus}
                    expiration={formatDate(item.fechaVencimiento)}
                    warehouse={item.ubicacion}
                    initialQuantity={isSelected ? 1 : 0}
                    onAddToCart={handleAddToCart}
                    onStockValidationError={handleStockValidationError}
                  />
                );
              }}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color={textColor + '60'} />
                  <Text style={[styles.emptyText, { color: textColor }]}>
                    {searchQuery
                      ? t('components.productSelector.noProducts')
                      : t('components.productSelector.noProductsAvailable')}
                  </Text>
                </View>
              }
            />
          )}

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: textColor + '20' }]}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.footerButton,
                styles.closeFooterButton,
                { borderColor: textColor + '40', opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.footerButtonText, { color: textColor }]}>
                {t('components.productSelector.continue')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  resultsCount: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  footerButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeFooterButton: {
    borderWidth: 1,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

