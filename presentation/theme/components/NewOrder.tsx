import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useThemeColor } from '../hooks/useThemeColor';
import ClienteSelector from './ClienteSelector';
import ProductSelectionModal from './ProductSelectionModal';
import ShoppingCart from './ShoppingCart';
import { Cliente } from '@/core/clientes/interface/cliente';
import { PedidoItem, PedidoCreateRequest } from '@/core/pedidos/interface/pedido';
import { getClientesGerenteMock, getProductsMock, createOrderMock, getProductBySkuMock, checkStockMock, Product } from '@/core/pedidos/api/pedidosApi';
import { fetchClientesDeGerente } from '@/core/clientes/actions/clientes-actions';

type OrderStep = 'cliente' | 'productos' | 'resumen' | 'confirmacion';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (orderId: string, refNumber: string) => void;
}

export default function NewOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
}: NewOrderModalProps) {
  const { user, hasRole } = useAuthStore();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // Determinar rol
  const isGerenteCuenta = hasRole('gerente_cuenta');
  const isUsuarioInstitucional = hasRole('usuario_institucional');

  // Estados del flujo
  const [currentStep, setCurrentStep] = useState<OrderStep>(
    isGerenteCuenta ? 'cliente' : 'productos'
  );
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [cartItems, setCartItems] = useState<PedidoItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Cargar productos al abrir modal principal
  useEffect(() => {
    if (isOpen && products.length === 0) {
      loadProducts();
    }
  }, [isOpen]);

  // Recargar productos cada vez que se abre el modal de selección de productos
  // para obtener el stock actualizado
  useEffect(() => {
    if (isProductModalOpen) {
      loadProducts();
    }
  }, [isProductModalOpen]);

  // Cargar clientes si es gerente
  useEffect(() => {
    if (isOpen && isGerenteCuenta && clientes.length === 0) {
      loadClientes();
    }
  }, [isOpen, isGerenteCuenta]);

  // Auto-asignar cliente para usuario institucional
  useEffect(() => {
    if (isOpen && isUsuarioInstitucional && user?.id) {
      // Simular cliente desde user (en producción vendría del backend)
      const mockCliente: Cliente = {
        cliente_id: parseInt(user.id) || 1, // Usar ID del usuario como cliente_id
        nit: '900123456-1',
        nombre_comercial: user.fullName || 'Mi Institución',
        razon_social: user.fullName || 'Mi Institución',
        tipo_institucion: 'Hospital',
        pais: 'Colombia',
        activo: true,
      };
      setSelectedCliente(mockCliente);
    }
  }, [isOpen, isUsuarioInstitucional, user]);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const productsData = await getProductsMock();
      setProducts(productsData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
      console.error('Error loading products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadClientes = async () => {
    setIsLoadingClientes(true);
    try {
      const gerenteId = parseInt(user?.id || '1');
      
      // Intentar usar API real primero, sino usar mock
      try {
        const response = await fetchClientesDeGerente(gerenteId);
        setClientes(response.clientes);
      } catch {
        // Fallback a mock
        const mockClientes = await getClientesGerenteMock(gerenteId);
        setClientes(mockClientes as Cliente[]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los clientes');
      console.error('Error loading clientes:', error);
    } finally {
      setIsLoadingClientes(false);
    }
  };

  // Mapa de stock para validaciones
  const productStockMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((product) => {
      map.set(product.sku, product.stock);
    });
    return map;
  }, [products]);

  // Manejar selección de cliente
  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    // Avanzar al siguiente paso
    setCurrentStep('productos');
  };

  // Manejar agregar producto al carrito
  const handleAddToCart = async (sku: string, cantidad: number) => {
    try {
      const product = await getProductBySkuMock(sku);
      if (!product) {
        Alert.alert('Error', 'Producto no encontrado');
        return;
      }

      // Validar stock en tiempo real antes de agregar al carrito
      const stockCheck = await checkStockMock(product.productoId, cantidad);
      
      if (!stockCheck.valid) {
        Alert.alert('Stock Insuficiente', stockCheck.message || 'No hay suficiente stock disponible');
        // Recargar productos para actualizar el stock mostrado
        await loadProducts();
        return;
      }

      // Calcular cantidad total que se solicitaría (incluyendo lo que ya está en el carrito)
      const existingItem = cartItems.find((item) => item.sku === sku);
      const cantidadTotalSolicitada = (existingItem?.cantidad || 0) + cantidad;

      // Validar que la cantidad total no exceda el stock disponible
      if (cantidadTotalSolicitada > stockCheck.available) {
        Alert.alert(
          'Stock Insuficiente',
          `Stock insuficiente. Disponible: ${stockCheck.available} unidades. Ya tienes ${existingItem?.cantidad || 0} en el carrito.`
        );
        // Recargar productos para actualizar el stock mostrado
        await loadProducts();
        return;
      }

      // Verificar si ya está en el carrito
      const existingIndex = cartItems.findIndex((item) => item.sku === sku);

      if (existingIndex >= 0) {
        // Actualizar cantidad
        const newItems = [...cartItems];
        newItems[existingIndex].cantidad += cantidad;
        setCartItems(newItems);
      } else {
        // Agregar nuevo item
        const newItem: PedidoItem = {
          productoId: product.productoId,
          sku: product.sku,
          nombre: product.nombre,
          cantidad,
          precio: product.precio,
        };
        setCartItems([...cartItems, newItem]);
      }

      // Actualizar el stock en el estado local de productos para reflejar el cambio
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.sku === sku
            ? { ...p, stock: stockCheck.available - cantidadTotalSolicitada }
            : p
        )
      );

      Alert.alert('Éxito', 'Producto agregado al carrito');
    } catch (error) {
      console.error('Error agregando producto al carrito:', error);
      Alert.alert('Error', 'No se pudo agregar el producto al carrito');
    }
  };

  // Manejar actualizar cantidad en carrito
  const handleUpdateQuantity = async (sku: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(sku);
      return;
    }

    // Buscar el producto para obtener su ID
    const product = products.find((p) => p.sku === sku);
    if (!product) {
      Alert.alert('Error', 'Producto no encontrado');
      return;
    }

    // Validar stock en tiempo real antes de actualizar
    const stockCheck = await checkStockMock(product.productoId, newQuantity);
    
    if (!stockCheck.valid || newQuantity > stockCheck.available) {
      Alert.alert(
        'Stock Insuficiente',
        stockCheck.message || `Stock insuficiente. Disponible: ${stockCheck.available} unidades`
      );
      // Recargar productos para actualizar el stock mostrado
      await loadProducts();
      return;
    }

    const newItems = cartItems.map((item) =>
      item.sku === sku ? { ...item, cantidad: newQuantity } : item
    );
    setCartItems(newItems);

    // Actualizar el stock en el estado local
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.sku === sku
          ? { ...p, stock: stockCheck.available - newQuantity }
          : p
      )
    );
  };

  // Manejar remover del carrito
  const handleRemoveItem = (sku: string) => {
    setCartItems(cartItems.filter((item) => item.sku !== sku));
    // Actualizar stock localmente cuando se remueve del carrito
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const removedItem = cartItems.find((item) => item.sku === sku);
        if (p.sku === sku && removedItem) {
          return { ...p, stock: (p.stock || 0) + removedItem.cantidad };
        }
        return p;
      })
    );
  };

  // Manejar navegación de pasos
  const handleNext = () => {
    if (currentStep === 'cliente') {
      if (!selectedCliente) {
        Alert.alert('Validación', 'Debes seleccionar un cliente');
        return;
      }
      setCurrentStep('productos');
    } else if (currentStep === 'productos') {
      if (cartItems.length === 0) {
        Alert.alert('Validación', 'Debes agregar al menos un producto');
        return;
      }
      setCurrentStep('resumen');
    } else if (currentStep === 'resumen') {
      setCurrentStep('confirmacion');
      handleSubmitOrder();
    }
  };

  const handleBack = () => {
    if (currentStep === 'productos') {
      if (isGerenteCuenta) {
        setCurrentStep('cliente');
      }
    } else if (currentStep === 'resumen') {
      setCurrentStep('productos');
    } else if (currentStep === 'confirmacion') {
      setCurrentStep('resumen');
    }
  };

  // Crear pedido
  const handleSubmitOrder = async () => {
    if (!selectedCliente || cartItems.length === 0) {
      Alert.alert('Error', 'Faltan datos para crear el pedido');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderRequest: PedidoCreateRequest = {
        cliente_id: selectedCliente.cliente_id,
        gerente_id: isGerenteCuenta ? parseInt(user?.id || '1') : undefined,
        items: cartItems,
      };

      const response = await createOrderMock(orderRequest);

      // Recargar productos para actualizar el stock después de crear el pedido
      await loadProducts();

      Alert.alert(
        'Pedido Creado',
        `Pedido ${response.refNumber} creado exitosamente`,
        [
          {
            text: 'OK',
            onPress: () => {
              onOrderCreated?.(response.id, response.refNumber);
              handleClose();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el pedido');
      setCurrentStep('resumen');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar y resetear
  const handleClose = () => {
    setCurrentStep(isGerenteCuenta ? 'cliente' : 'productos');
    setSelectedCliente(null);
    setCartItems([]);
    setIsProductModalOpen(false);
    onClose();
  };

  // Títulos de pasos
  const getStepTitle = () => {
    switch (currentStep) {
      case 'cliente':
        return 'Paso 1: Seleccionar Cliente';
      case 'productos':
        return 'Paso 2: Seleccionar Productos';
      case 'resumen':
        return 'Paso 3: Revisar Pedido';
      case 'confirmacion':
        return 'Confirmando...';
      default:
        return 'Nuevo Pedido';
    }
  };

  // Indicador de pasos
  const getStepNumber = (step: OrderStep): number => {
    if (isGerenteCuenta) {
      return step === 'cliente' ? 1 : step === 'productos' ? 2 : 3;
    } else {
      return step === 'productos' ? 1 : 2;
    }
  };

  const currentStepNumber = getStepNumber(currentStep);
  const totalSteps = isGerenteCuenta ? 3 : 2;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: primaryColor + '20' }]}>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              {getStepTitle()}
            </Text>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: textColor, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close" size={24} color={backgroundColor} />
            </Pressable>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {Array.from({ length: totalSteps }).map((_, index) => {
              const stepNum = index + 1;
              const isActive = stepNum === currentStepNumber;
              const isCompleted = stepNum < currentStepNumber;

              return (
                <React.Fragment key={stepNum}>
                  <View style={styles.stepCircleContainer}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor: isCompleted
                            ? primaryColor
                            : isActive
                            ? primaryColor
                            : textColor + '30',
                        },
                      ]}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={16} color="white" />
                      ) : (
                        <Text
                          style={[
                            styles.stepNumber,
                            {
                              color: isActive ? 'white' : textColor,
                            },
                          ]}
                        >
                          {stepNum}
                        </Text>
                      )}
                    </View>
                  </View>
                  {index < totalSteps - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor: isCompleted
                            ? primaryColor
                            : textColor + '30',
                        },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Content */}
          {currentStep === 'cliente' ? (
            <View style={styles.content}>
              <ClienteSelector
                clientes={clientes}
                selectedClienteId={selectedCliente?.cliente_id}
                onSelectCliente={handleSelectCliente}
                isLoading={isLoadingClientes}
              />
            </View>
          ) : currentStep === 'resumen' ? (
            <View style={styles.content}>
              <ShoppingCart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                productStockMap={productStockMap}
              />
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {currentStep === 'productos' && (
              <View style={styles.productStepContainer}>
                {isLoadingProducts ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={primaryColor} />
                    <Text style={[styles.loadingText, { color: textColor }]}>
                      Cargando productos...
                    </Text>
                  </View>
                ) : (
                  <>
                    <Pressable
                      onPress={() => setIsProductModalOpen(true)}
                      style={({ pressed }) => [
                        styles.addProductButton,
                        {
                          backgroundColor: primaryColor,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Ionicons name="add-circle" size={24} color="white" />
                      <Text style={styles.addProductText}>
                        Agregar Productos
                      </Text>
                    </Pressable>

                    {cartItems.length > 0 && (
                      <View style={styles.cartPreview}>
                        <Text style={[styles.cartPreviewTitle, { color: textColor }]}>
                          Productos en el carrito ({cartItems.length})
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {currentStep === 'confirmacion' && (
              <View style={styles.confirmationContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={[styles.confirmationText, { color: textColor }]}>
                  Creando pedido...
                </Text>
              </View>
            )}
            </ScrollView>
          )}

          {/* Footer Navigation */}
          {currentStep !== 'confirmacion' && (
            <View style={[styles.footer, { borderTopColor: textColor + '20' }]}>
              {currentStep !== (isGerenteCuenta ? 'cliente' : 'productos') && (
                <Pressable
                  onPress={handleBack}
                  style={({ pressed }) => [
                    styles.footerButton,
                    styles.backButton,
                    { borderColor: textColor + '40', opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Ionicons name="arrow-back" size={20} color={textColor} />
                  <Text style={[styles.footerButtonText, { color: textColor }]}>
                    Atrás
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={handleNext}
                disabled={
                  (currentStep === 'cliente' && !selectedCliente) ||
                  (currentStep === 'productos' && cartItems.length === 0) ||
                  (currentStep === 'resumen' && cartItems.length === 0)
                }
                style={({ pressed }) => [
                  styles.footerButton,
                  styles.nextButton,
                  {
                    backgroundColor: primaryColor,
                    opacity:
                      pressed ||
                      (currentStep === 'cliente' && !selectedCliente) ||
                      (currentStep === 'productos' && cartItems.length === 0) ||
                      (currentStep === 'resumen' && cartItems.length === 0)
                        ? 0.5
                        : 1,
                  },
                ]}
              >
                <Text style={[styles.footerButtonText, { color: 'white' }]}>
                  {currentStep === 'resumen' ? 'Confirmar Pedido' : 'Siguiente'}
                </Text>
                {currentStep !== 'resumen' && (
                  <Ionicons name="arrow-forward" size={20} color="white" />
                )}
              </Pressable>
            </View>
          )}

          {/* Product Selection Modal */}
            <ProductSelectionModal
              isOpen={isProductModalOpen}
              onClose={() => {
                setIsProductModalOpen(false);
                // Recargar productos al cerrar el modal para actualizar stock
                loadProducts();
              }}
              onAddToCart={handleAddToCart}
              products={products}
              isLoading={isLoadingProducts}
            />
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
    fontSize: 18,
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  stepCircleContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productStepContainer: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  addProductText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cartPreview: {
    padding: 12,
    borderRadius: 8,
  },
  cartPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  confirmationText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButton: {
    borderWidth: 1,
  },
  nextButton: {
    // backgroundColor set dynamically
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
