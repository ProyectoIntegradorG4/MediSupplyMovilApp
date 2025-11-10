/**
 * API Client para Pedidos
 * 
 * Conectado al backend pedidos-service y product-service
 * Cumple con requisitos de las HUs HU-MOV-008 y HU-MOV-005
 * 
 * @module core/pedidos/api/pedidosApi
 */

import { CONFIG } from '@/constants/config';
import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import axios from 'axios';
import {
  Pedido,
  PedidoCreateRequest,
  PedidoCreateRequestBackend,
  PedidoCreateResponse,
  PedidosFilter,
  PedidosListResponse,
  PedidoItem,
  formatAmount,
} from '../interface/pedido';

// Tipo para productos (compatible con ProductCard)
export interface Product {
  productoId: string;
  nombre: string;
  sku: string;
  precio: number;
  stock: number;
  stockStatus?: 'available' | 'low' | 'medium';
  fechaVencimiento?: string;
  ubicacion?: string;
  categoria?: string;
}

/**
 * Cliente Axios configurado para peticiones a pedidos-service y product-service
 * Base URL: API Gateway (puerto 80)
 */
const pedidosApi = axios.create({
  baseURL: CONFIG.API.GATEWAY_URL,
  timeout: CONFIG.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar token JWT y headers de usuario automáticamente
 */
pedidosApi.interceptors.request.use(async (config) => {
  const token = await SecureStorageAdapter.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Headers requeridos por pedidos-service
  // Estos valores deberían venir del JWT token decodificado en producción
  // Por ahora, intentamos obtenerlos del token o los seteamos manualmente
  const userData = await SecureStorageAdapter.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.id && !config.headers['usuario-id']) {
        config.headers['usuario-id'] = String(user.id);
      }
      if (user.roles && user.roles.length > 0 && !config.headers['rol-usuario']) {
        // Mapear roles: 'gerente_cuenta' -> 'gerente_cuenta', otros -> 'admin' por defecto
        const rol = user.roles.includes('gerente_cuenta') ? 'gerente_cuenta' :
                    user.roles.includes('usuario_institucional') ? 'usuario_institucional' :
                    'admin';
        config.headers['rol-usuario'] = rol;
      }
      // Agregar NIT del usuario si está disponible (necesario para usuario_institucional)
      if (user.nit && !config.headers['nit-usuario']) {
        config.headers['nit-usuario'] = user.nit;
        console.log(`📋 [PEDIDOS API] NIT usuario agregado al header: ${user.nit}`);
      } else if (!user.nit) {
        console.warn('⚠️ [PEDIDOS API] Usuario sin NIT en storage:', user);
      }
      // Para usuario_institucional: si tenemos clienteId en el usuario, enviarlo en header
      if (Array.isArray(user.roles) && user.roles.includes('usuario_institucional') && (user.clienteId || user.cliente_id)) {
        const clienteId = user.clienteId ?? user.cliente_id;
        config.headers['cliente-id'] = String(clienteId);
      }
    } catch (e) {
      console.error('❌ [PEDIDOS API] Error parseando userData:', e);
    }
  } else {
    console.warn('⚠️ [PEDIDOS API] No se encontró userData en storage');
  }

  return config;
});

/**
 * Interceptor para logging en modo desarrollo
 */
if (CONFIG.DEBUG) {
  pedidosApi.interceptors.request.use((config) => {
    console.log(`🌐 [PEDIDOS API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.headers['usuario-id']) {
      console.log(`   usuario-id: ${config.headers['usuario-id']}`);
      console.log(`   rol-usuario: ${config.headers['rol-usuario']}`);
      console.log(`   nit-usuario: ${config.headers['nit-usuario'] || 'NO ENVIADO'}`);
    }
    return config;
  });

  pedidosApi.interceptors.response.use(
    (response) => {
      console.log(`✅ [PEDIDOS API] ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error(`❌ [PEDIDOS API] ${error.response?.status || 'ERROR'} ${error.config?.url}`);
      console.error(`   Error:`, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

// ========================================
// FUNCIONES DE PRODUCTOS
// ========================================

/**
 * Obtiene el catálogo de productos con inventario
 * Endpoint: GET /api/v1/productos (product-service)
 * 
 * @returns Array de productos con stock disponible
 */
export const getProductsMock = async (): Promise<Product[]> => {
  try {
    const response = await pedidosApi.get('/api/v1/productos', {
      params: {
        estado_producto: 'activo',
        page: 1,
        page_size: 100, // Ajustar según necesidades
      },
    });

    const productos = response.data.items || [];
    
    // Mapear al formato esperado por el frontend
    return productos.map((p: any) => ({
      productoId: p.productoId,
      nombre: p.nombre,
      sku: p.sku || `SKU-${p.productoId.substring(0, 8)}`,
      precio: p.precio || 0.0,
      stock: p.stock || 0,
      stockStatus: (p.stock || 0) > 10 ? 'available' : (p.stock || 0) > 0 ? 'low' : 'medium',
      fechaVencimiento: p.fechaVencimiento || undefined,
      ubicacion: p.ubicacion || p.location || undefined,
      categoria: p.categoria || undefined,
    }));
  } catch (error: any) {
    console.error('❌ [PedidosAPI] Error loading products:', error);
    throw new Error(error.response?.data?.detail || 'Error al cargar productos del inventario');
  }
};

/**
 * Valida stock disponible en tiempo real
 * Endpoint: GET /api/productos/{producto_id}/inventario (product-service)
 * Cumple con requisito de respuesta < 2 segundos
 * 
 * @param productoId ID del producto (UUID)
 * @param cantidad Cantidad requerida
 * @returns Objeto con validez y stock disponible
 */
export const checkStockMock = async (
  productoId: string,
  cantidad: number
): Promise<{ valid: boolean; available: number; message?: string }> => {
  try {
    const response = await pedidosApi.get(`/api/productos/${productoId}/inventario`);

    const { cantidad_disponible } = response.data;

    if (cantidad_disponible === 0) {
      return {
        valid: false,
        available: 0,
        message: 'Producto sin stock disponible',
      };
    }

    if (cantidad > cantidad_disponible) {
      return {
        valid: false,
        available: cantidad_disponible,
        message: `Stock insuficiente. Disponible: ${cantidad_disponible} unidades`,
      };
    }

    return {
      valid: true,
      available: cantidad_disponible,
    };
  } catch (error: any) {
    console.error('❌ [PedidosAPI] Error checking stock:', error);
    
    if (error.response?.status === 404) {
      return {
        valid: false,
        available: 0,
        message: 'Producto no encontrado',
      };
    }
    
    return {
      valid: false,
      available: 0,
      message: error.response?.data?.detail || 'Error al validar stock',
    };
  }
};

/**
 * Obtiene un producto por SKU
 * Endpoint: GET /api/v1/productos?sku={sku} (product-service)
 * 
 * @param sku SKU del producto
 * @returns Producto o null si no existe
 */
export const getProductBySkuMock = async (sku: string): Promise<Product | null> => {
  try {
    const response = await pedidosApi.get('/api/v1/productos', {
      params: {
        sku: sku,
        estado_producto: 'activo',
        page: 1,
        page_size: 1,
      },
    });

    const productos = response.data.items || [];
    
    if (productos.length === 0) {
      return null;
    }

    const p = productos[0];
    return {
      productoId: p.productoId,
      nombre: p.nombre,
      sku: p.sku || `SKU-${p.productoId.substring(0, 8)}`,
      precio: p.precio || 0.0,
      stock: p.stock || 0,
      stockStatus: (p.stock || 0) > 10 ? 'available' : (p.stock || 0) > 0 ? 'low' : 'medium',
      fechaVencimiento: p.fechaVencimiento || undefined,
      ubicacion: p.ubicacion || p.location || undefined,
      categoria: p.categoria || undefined,
    };
  } catch (error: any) {
    console.error('❌ [PedidosAPI] Error getting product by SKU:', error);
    return null;
  }
};

// ========================================
// FUNCIONES DE CLIENTES (Para Gerente)
// ========================================

/**
 * Obtiene los clientes asignados a un gerente
 * Endpoint: GET /api/v1/clientes/mis-clientes?gerente_id={id} (cliente-service)
 * 
 * @param gerenteId ID del gerente
 * @returns Array de clientes asignados
 */
export const getClientesGerenteMock = async (gerenteId: number) => {
  try {
    const response = await pedidosApi.get('/api/v1/clientes/mis-clientes', {
      params: {
        gerente_id: gerenteId,
      },
    });

    return response.data.clientes || [];
  } catch (error: any) {
    console.error('❌ [PedidosAPI] Error loading clientes:', error);
    return [];
  }
};

// ========================================
// FUNCIONES DE PEDIDOS
// ========================================

/**
 * Obtiene pedidos filtrados por cliente (usuario_institucional)
 * Endpoint: GET /api/v1/pedidos/?usuario_id={id} (pedidos-service)
 * 
 * @param clienteId ID del cliente (requerido para usuario_institucional)
 * @param filters Filtros opcionales
 * @returns Lista paginada de pedidos del cliente
 */
export const getPedidosByClienteMock = async (
  clienteId?: number,
  filters?: Omit<PedidosFilter, 'cliente_id'>
): Promise<PedidosListResponse> => {
  try {
    // Para usuario_institucional, el backend filtra automáticamente por NIT desde los headers
    // No es necesario enviar usuario_id como parámetro, el backend lo obtendrá del header
    const response = await pedidosApi.get('/api/v1/pedidos/', {
      params: {
        ...(clienteId ? { cliente_id: clienteId } : {}),
        // No enviar usuario_id, el backend filtrará automáticamente por NIT del header
        estado: filters?.status,
        pagina: filters?.page || 1,
        por_pagina: filters?.limit || 25,
      },
    });

    const pedidos = response.data.pedidos || [];
    
    // Mapear al formato esperado por el frontend
    const pedidosMapeados: Pedido[] = pedidos.map((p: any) => ({
      id: p.pedido_id,
      cliente_id: p.cliente_id ?? (clienteId || 0),
      hospital: p.nit || 'N/A', // Usar NIT como identificador temporal
      type: 'Hospital' as any,
      status: p.estado as any,
      refNumber: p.numero_pedido,
      time: new Date(p.fecha_creacion).toLocaleTimeString(),
      phone: '',
      doctor: '',
      amount: formatAmount(p.monto_total),
      units: String(p.detalles?.reduce((sum: number, d: any) => sum + d.cantidad_solicitada, 0) || 0),
      creationDate: new Date(p.fecha_creacion).toLocaleDateString('es-CO'),
      deliveryDate: '',
      items: (p.detalles || []).map((d: any) => ({
        productoId: d.producto_id,
        sku: `SKU-${d.producto_id.substring(0, 8)}`,
        nombre: d.nombre_producto,
        cantidad: d.cantidad_solicitada,
        precio: d.precio_unitario,
        subtotal: d.subtotal,
      })),
    }));

    return {
      total: response.data.total || 0,
      page: response.data.pagina || 1,
      limit: response.data.por_pagina || 25,
      pedidos: pedidosMapeados,
    };
  } catch (error: any) {
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
 * Endpoint: GET /api/v1/pedidos/ (pedidos-service filtra según rol)
 * 
 * @param gerenteId ID del gerente
 * @param filters Filtros opcionales (incluye NIT para filtrar por cliente específico)
 * @returns Lista paginada de pedidos de los clientes del gerente
 */
export const getPedidosByGerenteMock = async (
  gerenteId: number,
  filters?: Omit<PedidosFilter, 'gerente_id'>
): Promise<PedidosListResponse> => {
  try {
    const response = await pedidosApi.get('/api/v1/pedidos/', {
      params: {
        nit: filters?.nit, // Filtrar por NIT específico si se proporciona
        estado: filters?.status,
        pagina: filters?.page || 1,
        por_pagina: filters?.limit || 25,
      },
    });

    const pedidos = response.data.pedidos || [];
    
    // Mapear al formato esperado por el frontend
    const pedidosMapeados: Pedido[] = pedidos.map((p: any) => ({
      id: p.pedido_id,
      cliente_id: 0, // El backend no retorna cliente_id directamente
      hospital: p.nit || 'N/A',
      type: 'Hospital' as any,
      status: p.estado as any,
      refNumber: p.numero_pedido,
      time: new Date(p.fecha_creacion).toLocaleTimeString(),
      phone: '',
      doctor: '',
      amount: formatAmount(p.monto_total),
      units: String(p.detalles?.reduce((sum: number, d: any) => sum + d.cantidad_solicitada, 0) || 0),
      creationDate: new Date(p.fecha_creacion).toLocaleDateString('es-CO'),
      deliveryDate: '',
      gerente_id: gerenteId,
      items: (p.detalles || []).map((d: any) => ({
        productoId: d.producto_id,
        sku: `SKU-${d.producto_id.substring(0, 8)}`,
        nombre: d.nombre_producto,
        cantidad: d.cantidad_solicitada,
        precio: d.precio_unitario,
        subtotal: d.subtotal,
      })),
    }));

    return {
      total: response.data.total || 0,
      page: response.data.pagina || 1,
      limit: response.data.por_pagina || 25,
      pedidos: pedidosMapeados,
    };
  } catch (error: any) {
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
 * Endpoint: POST /api/v1/pedidos/ (pedidos-service)
 * 
 * @param request Datos del pedido a crear
 * @returns Pedido creado con número único
 */
export const createOrderMock = async (
  request: PedidoCreateRequest
): Promise<PedidoCreateResponse> => {
  try {
    // Obtener usuario actual para headers
    const token = await SecureStorageAdapter.getItem('token');
    const userData = await SecureStorageAdapter.getItem('user');
    
    let usuarioId = 1;
    let rolUsuario = 'usuario_institucional';
    let nit = '900123456'; // Fallback
    let clienteIdForOrder: number | undefined = request.cliente_id;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        usuarioId = parseInt(user.id) || usuarioId;
        
        if (user.roles?.includes('gerente_cuenta')) {
          rolUsuario = 'gerente_cuenta';
          // Para gerente_cuenta, mantener NIT por cliente seleccionado (requiere fetch)
          if (!clienteIdForOrder) {
            throw new Error('cliente_id es requerido para gerente_cuenta');
          }
          // Cargar cliente para obtener NIT
          const clientes = await getClientesGerenteMock(parseInt(user.id) || 1);
          const cliente = clientes.find((c: any) => c.cliente_id === clienteIdForOrder);
          nit = cliente?.nit || nit;
        } else if (user.roles?.includes('usuario_institucional')) {
          rolUsuario = 'usuario_institucional';
          // Para usuario_institucional, el NIT y cliente_id vienen del usuario
          nit = user.nit || nit;
          clienteIdForOrder = user.clienteId ?? user.cliente_id ?? clienteIdForOrder;
          if (!clienteIdForOrder) {
            throw new Error('cliente_id es requerido para usuario_institucional');
          }
        }
      } catch (e) {
        // Ignorar
      }
    }

    // Convertir formato frontend a formato backend
    const requestBackend: PedidoCreateRequestBackend = {
      nit: nit,
      cliente_id: clienteIdForOrder as number,
      productos: request.items.map(item => ({
        producto_id: item.productoId,
        cantidad_solicitada: item.cantidad,
      })),
      observaciones: request.observaciones,
    };

    const extraHeaders: Record<string, string> = {
      'usuario-id': String(usuarioId),
      'rol-usuario': rolUsuario,
    };
    // Para usuario_institucional, enviar también cliente-id con la sede seleccionada
    if (rolUsuario === 'usuario_institucional' && clienteIdForOrder) {
      extraHeaders['cliente-id'] = String(clienteIdForOrder);
    }

    const response = await pedidosApi.post('/api/v1/pedidos/', requestBackend, { headers: extraHeaders });

    const pedidoData = response.data.pedido || response.data;

    // Mapear respuesta del backend al formato frontend
    const total = pedidoData.monto_total || 0;
    const items: PedidoItem[] = (pedidoData.detalles || []).map((d: any) => ({
      productoId: d.producto_id,
      sku: `SKU-${d.producto_id.substring(0, 8)}`,
      nombre: d.nombre_producto,
      cantidad: d.cantidad_solicitada,
      precio: d.precio_unitario,
      subtotal: d.subtotal,
    }));

    const newPedido: PedidoCreateResponse = {
      id: pedidoData.pedido_id || pedidoData.id,
      refNumber: pedidoData.numero_pedido || `PED-${Date.now()}`,
      status: pedidoData.estado || 'pendiente',
      cliente_id: pedidoData.cliente_id ?? request.cliente_id,
      items: items,
      total: total,
      createdAt: pedidoData.fecha_creacion || new Date().toISOString(),
    };

    console.log('✅ [PedidosAPI] Order created:', {
      id: newPedido.id,
      refNumber: newPedido.refNumber,
      cliente_id: newPedido.cliente_id,
      total: formatAmount(newPedido.total),
    });

    return newPedido;
  } catch (error: any) {
    console.error('❌ [PedidosAPI] Error creating order:', error);
    
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === 'string') {
        throw new Error(detail);
      }
      if (detail.error === 'INVENTARIO_INSUFICIENTE') {
        throw new Error(detail.mensaje || 'Inventario insuficiente para uno o más productos');
      }
    }
    
    throw error;
  }
};

// ========================================
// EXPORTS
// ========================================

export type { Product };

// ========================================
// FUNCIONES DE ENTREGAS
// ========================================
// ========================================
// FUNCIONES DE HISTORIAL DE PEDIDOS
// ========================================

/**
 * Obtiene historial de un pedido
 * Endpoint: GET /api/v1/pedidos/{pedido_id}/historial
 */
export const getPedidoHistorial = async (pedidoId: string) => {
  try {
    const response = await pedidosApi.get(`/api/v1/pedidos/${encodeURIComponent(pedidoId)}/historial`);
    return response.data;
  } catch (error: any) {
    console.error('❌ [PedidosAPI] Error loading historial:', error);
    throw new Error(error.response?.data?.detail || 'Error al cargar historial del pedido');
  }
};

/**
 * Obtiene un pedido por ID
 * Endpoint: GET /api/v1/pedidos/{pedido_id}
 */
export const getPedidoById = async (pedidoId: string) => {
  try {
    const response = await pedidosApi.get(`/api/v1/pedidos/${encodeURIComponent(pedidoId)}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ [PedidosAPI] Error loading pedido by id:', error);
    throw new Error(error.response?.data?.detail || 'Error al cargar el pedido');
  }
};

/**
 * Lista entregas por NIT con filtro opcional por estado
 * Endpoint: GET /api/v1/entregas/{nit}?estado=programada
 */
export const getEntregasByNit = async (
  nit: string,
  options?: { estado?: 'programada' | 'en_ruta' | 'entregada' | 'devuelta'; page?: number; limit?: number }
) => {
  try {
    const response = await pedidosApi.get(`/api/v1/entregas/${encodeURIComponent(nit)}`, {
      params: {
        estado: options?.estado,
        pagina: options?.page || 1,
        por_pagina: options?.limit || 25,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ [PedidosAPI] Error loading entregas:', error);
    throw new Error(error.response?.data?.detail || 'Error al cargar entregas');
  }
};

/**
 * Obtiene tracking de una entrega
 * Endpoint: GET /api/v1/entregas/{entrega_id}/tracking
 */
export const getEntregaTracking = async (entregaId: string) => {
  try {
    const response = await pedidosApi.get(`/api/v1/entregas/${encodeURIComponent(entregaId)}/tracking`);
    return response.data;
  } catch (error: any) {
    console.error('❌ [PedidosAPI] Error loading tracking:', error);
    throw new Error(error.response?.data?.detail || 'Error al cargar tracking de entrega');
  }
};