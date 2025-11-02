/**
 * API Mock para Pedidos
 * 
 * Funciones mock para simular API calls hasta que el backend esté disponible
 * Cumple con requisitos de las HUs HU-MOV-008 y HU-MOV-005
 * 
 * @module core/pedidos/api/pedidosApi
 */

import { loadMockData } from '@/helpers/mockDataLoader';
import {
  Pedido,
  PedidoCreateRequest,
  PedidoCreateResponse,
  PedidosFilter,
  PedidosListResponse,
  PedidoItem,
  generateRefNumber,
  calculatePedidoTotal,
  formatAmount,
  validatePedidoItems,
} from '../interface/pedido';

// Tipo para productos mock (compatible con ProductCard)
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

// ========================================
// FUNCIONES DE PRODUCTOS
// ========================================

/**
 * Obtiene el catálogo de productos con inventario
 * Delay simulado < 2 segundos según HU
 * 
 * @returns Array de productos con stock disponible
 */
export const getProductsMock = async (): Promise<Product[]> => {
  try {
    const products = await loadMockData<Product[]>('data/mock-products.json');
    console.log(`✅ [PedidosAPI] Loaded ${products.length} products`);
    return products;
  } catch (error) {
    console.error('❌ [PedidosAPI] Error loading products:', error);
    throw new Error('Error al cargar productos del inventario');
  }
};

/**
 * Valida stock disponible en tiempo real
 * Cumple con requisito de respuesta < 2 segundos
 * 
 * @param sku SKU del producto
 * @param cantidad Cantidad requerida
 * @returns Objeto con validez y stock disponible
 */
export const checkStockMock = async (
  sku: string,
  cantidad: number
): Promise<{ valid: boolean; available: number; message?: string }> => {
  try {
    // Simular delay de validación (< 500ms)
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 400));

    const products = await getProductsMock();
    const product = products.find((p) => p.sku === sku);

    if (!product) {
      return {
        valid: false,
        available: 0,
        message: 'Producto no encontrado',
      };
    }

    if (product.stock === 0) {
      return {
        valid: false,
        available: 0,
        message: 'Producto sin stock disponible',
      };
    }

    if (cantidad > product.stock) {
      return {
        valid: false,
        available: product.stock,
        message: `Stock insuficiente. Disponible: ${product.stock} unidades`,
      };
    }

    return {
      valid: true,
      available: product.stock,
    };
  } catch (error) {
    console.error('❌ [PedidosAPI] Error checking stock:', error);
    return {
      valid: false,
      available: 0,
      message: 'Error al validar stock',
    };
  }
};

/**
 * Obtiene un producto por SKU
 * 
 * @param sku SKU del producto
 * @returns Producto o null si no existe
 */
export const getProductBySkuMock = async (sku: string): Promise<Product | null> => {
  try {
    const products = await getProductsMock();
    return products.find((p) => p.sku === sku) || null;
  } catch (error) {
    console.error('❌ [PedidosAPI] Error getting product by SKU:', error);
    return null;
  }
};

// ========================================
// FUNCIONES DE CLIENTES (Para Gerente)
// ========================================

/**
 * Obtiene los clientes asignados a un gerente
 * Mock simplificado - en producción usaría clientesApi
 * 
 * @param gerenteId ID del gerente
 * @returns Array de clientes asignados
 */
export const getClientesGerenteMock = async (gerenteId: number) => {
  try {
    // En producción, esto usaría clientesApi.getClientes({ gerente_id: gerenteId })
    // Por ahora, retornamos clientes mock hardcodeados
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock: gerente_id 1 tiene clientes 1, 2, 3, 4, 5
    const mockClientes = [
      {
        cliente_id: 1,
        nombre_comercial: 'Hospital Universitario San Ignacio',
        tipo_institucion: 'Hospital',
        telefono: '+57 300 123 4567',
        contacto_principal: 'Dr. Juan Pérez',
      },
      {
        cliente_id: 2,
        nombre_comercial: 'Clínica Shaio',
        tipo_institucion: 'Clínica',
        telefono: '+57 310 987 6543',
        contacto_principal: 'Dra. María García',
      },
      {
        cliente_id: 3,
        nombre_comercial: 'Hospital El Country',
        tipo_institucion: 'Hospital',
        telefono: '+57 320 456 7890',
        contacto_principal: 'Dr. Carlos Rodríguez',
      },
      {
        cliente_id: 4,
        nombre_comercial: 'Centro Médico Los Rosales',
        tipo_institucion: 'Centro Médico',
        telefono: '+57 315 234 5678',
        contacto_principal: 'Dr. Luis Martínez',
      },
      {
        cliente_id: 5,
        nombre_comercial: 'IPS Salud Total',
        tipo_institucion: 'IPS',
        telefono: '+57 318 345 6789',
        contacto_principal: 'Dra. Ana López',
      },
    ];

    // Filtrar por gerente (mock: todos para gerente_id 1)
    if (gerenteId === 1) {
      return mockClientes;
    }

    return [];
  } catch (error) {
    console.error('❌ [PedidosAPI] Error loading clientes:', error);
    return [];
  }
};

// ========================================
// FUNCIONES DE PEDIDOS
// ========================================

/**
 * Obtiene pedidos filtrados por cliente (usuario_institucional)
 * 
 * @param clienteId ID del cliente (requerido para usuario_institucional)
 * @param filters Filtros opcionales
 * @returns Lista paginada de pedidos del cliente
 */
export const getPedidosByClienteMock = async (
  clienteId: number,
  filters?: Omit<PedidosFilter, 'cliente_id'>
): Promise<PedidosListResponse> => {
  try {
    const orders = await loadMockData<Pedido[]>('data/mock-orders.json');

    // Filtrar por cliente_id (OBLIGATORIO para usuario_institucional)
    let filteredOrders = orders.filter((order) => order.cliente_id === clienteId);

    // Aplicar filtros adicionales
    if (filters?.status) {
      filteredOrders = filteredOrders.filter((order) => order.status === filters.status);
    }

    // Paginación
    const page = filters?.page || 1;
    const limit = filters?.limit || 25;
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedOrders = filteredOrders.slice(start, end);

    return {
      total: filteredOrders.length,
      page,
      limit,
      pedidos: paginatedOrders,
    };
  } catch (error) {
    console.error('❌ [PedidosAPI] Error loading pedidos by cliente:', error);
    return {
      total: 0,
      page: 1,
      limit: 25,
      pedidos: [],
    };
  }
};

/**
 * Obtiene pedidos de todos los clientes de un gerente
 * 
 * @param gerenteId ID del gerente
 * @param filters Filtros opcionales
 * @returns Lista paginada de pedidos de los clientes del gerente
 */
export const getPedidosByGerenteMock = async (
  gerenteId: number,
  filters?: Omit<PedidosFilter, 'gerente_id'>
): Promise<PedidosListResponse> => {
  try {
    const orders = await loadMockData<Pedido[]>('data/mock-orders.json');

    // Obtener clientes del gerente
    const clientes = await getClientesGerenteMock(gerenteId);
    const clienteIds = clientes.map((c) => c.cliente_id);

    // Filtrar pedidos de los clientes del gerente
    let filteredOrders = orders.filter((order) => {
      return (
        clienteIds.includes(order.cliente_id) &&
        order.gerente_id === gerenteId
      );
    });

    // Aplicar filtros adicionales
    if (filters?.status) {
      filteredOrders = filteredOrders.filter((order) => order.status === filters.status);
    }

    // Paginación
    const page = filters?.page || 1;
    const limit = filters?.limit || 25;
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedOrders = filteredOrders.slice(start, end);

    return {
      total: filteredOrders.length,
      page,
      limit,
      pedidos: paginatedOrders,
    };
  } catch (error) {
    console.error('❌ [PedidosAPI] Error loading pedidos by gerente:', error);
    return {
      total: 0,
      page: 1,
      limit: 25,
      pedidos: [],
    };
  }
};

/**
 * Crea un nuevo pedido
 * 
 * @param request Datos del pedido a crear
 * @returns Pedido creado con número único
 */
export const createOrderMock = async (
  request: PedidoCreateRequest
): Promise<PedidoCreateResponse> => {
  try {
    // Validaciones
    if (!request.cliente_id) {
      throw new Error('cliente_id es requerido');
    }

    if (!validatePedidoItems(request.items)) {
      throw new Error('El pedido debe tener al menos un producto con cantidad > 0');
    }

    // Validar stock de todos los items
    for (const item of request.items) {
      const stockCheck = await checkStockMock(item.sku, item.cantidad);
      if (!stockCheck.valid) {
        throw new Error(
          stockCheck.message || `Stock insuficiente para ${item.sku}`
        );
      }
    }

    // Obtener información del cliente
    const clientes = await getClientesGerenteMock(request.gerente_id || 1);
    const cliente = clientes.find((c) => c.cliente_id === request.cliente_id);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Calcular totales
    const total = calculatePedidoTotal(request.items);

    // Generar número único
    const refNumber = generateRefNumber();

    // Crear pedido
    const now = new Date();
    const deliveryDate = new Date(now);
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Entrega en 3 días

    const newPedido: PedidoCreateResponse = {
      id: `ped-${Date.now()}`,
      refNumber,
      status: 'pendiente',
      cliente_id: request.cliente_id,
      items: request.items.map((item) => ({
        ...item,
        subtotal: item.cantidad * item.precio,
      })),
      total,
      createdAt: now.toISOString(),
    };

    // En producción, aquí se guardaría en la base de datos
    console.log('✅ [PedidosAPI] Order created:', {
      id: newPedido.id,
      refNumber: newPedido.refNumber,
      cliente_id: newPedido.cliente_id,
      total: formatAmount(newPedido.total),
    });

    return newPedido;
  } catch (error) {
    console.error('❌ [PedidosAPI] Error creating order:', error);
    throw error;
  }
};

// ========================================
// EXPORTS
// ========================================

export type { Product };

