/**
 * Interfaces y tipos para el módulo de Pedidos
 * 
 * Basado en las HUs HU-MOV-008 y HU-MOV-005
 * 
 * @module core/pedidos/interface/pedido
 */

// ========================================
// TIPOS Y ENUMS
// ========================================

/**
 * Estados de pedido según las HUs
 */
export type PedidoStatus = 'pendiente' | 'enviado' | 'entregado' | 'cancelado';

/**
 * Tipo de institución (compatible con Cliente)
 */
export type TipoInstitucion = 'Hospital' | 'Clínica' | 'IPS' | 'EPS' | 'Centro Médico';

// ========================================
// INTERFACES PRINCIPALES
// ========================================

/**
 * Item del pedido - Producto con cantidad y precio
 */
export interface PedidoItem {
  productoId: string;
  sku: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal?: number; // cantidad * precio (calculado)
}

/**
 * Datos del cliente en el pedido
 */
export interface ClientePedido {
  cliente_id: number;
  nombre_comercial: string;
  tipo_institucion: TipoInstitucion;
  telefono?: string;
  contacto_principal?: string;
}

/**
 * Estructura completa del pedido (como se guarda/retorna)
 */
export interface Pedido {
  id: string;
  cliente_id: number; // CRÍTICO: Para filtrado por institución
  hospital: string;
  type: TipoInstitucion;
  status: PedidoStatus;
  refNumber: string;
  time: string;
  phone: string;
  doctor: string;
  amount: string; // Formateado para mostrar
  units: string; // Formateado para mostrar
  creationDate: string; // Formato DD/MM/YYYY
  deliveryDate: string; // Formato DD/MM/YYYY
  gerente_id?: number; // Solo para gerente_cuenta
  items: PedidoItem[]; // Productos del pedido
}

/**
 * Request para crear un nuevo pedido (formato backend)
 */
export interface PedidoCreateRequestBackend {
  nit: string; // NIT del cliente (o del usuario si es institucional)
  productos: Array<{
    producto_id: string; // UUID del producto
    cantidad_solicitada: number; // Cantidad > 0
  }>;
  observaciones?: string;
}

/**
 * Request para crear un nuevo pedido (formato frontend)
 */
export interface PedidoCreateRequest {
  cliente_id: number; // REQUERIDO (automático para usuario_institucional)
  gerente_id?: number; // Solo si es gerente_cuenta
  items: PedidoItem[]; // Mínimo 1 producto
  observaciones?: string;
}

/**
 * Respuesta al crear un pedido
 */
export interface PedidoCreateResponse {
  id: string;
  refNumber: string;
  status: PedidoStatus;
  cliente_id: number;
  items: PedidoItem[];
  total: number;
  createdAt: string;
}

/**
 * Filtros para consultar pedidos
 */
export interface PedidosFilter {
  cliente_id?: number; // Para usuario_institucional (obligatorio)
  gerente_id?: number; // Para gerente_cuenta (obligatorio)
  nit?: string; // Filtrar por NIT específico (opcional para gerente_cuenta)
  status?: PedidoStatus;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

/**
 * Respuesta paginada de pedidos
 */
export interface PedidosListResponse {
  total: number;
  page: number;
  limit: number;
  pedidos: Pedido[];
}

// ========================================
// UTILIDADES
// ========================================

/**
 * Calcula el subtotal de un item
 */
export const calculateItemSubtotal = (item: PedidoItem): number => {
  return item.cantidad * item.precio;
};

/**
 * Calcula el total de un pedido
 */
export const calculatePedidoTotal = (items: PedidoItem[]): number => {
  return items.reduce((total, item) => {
    return total + calculateItemSubtotal(item);
  }, 0);
};

/**
 * Formatea el monto como string para mostrar
 */
export const formatAmount = (amount: number): string => {
  return `$${amount.toLocaleString('es-CO')}`;
};

/**
 * Genera número de referencia único
 */
export const generateRefNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `REF-${new Date().getFullYear()}-${String(random).padStart(3, '0')}`;
};

/**
 * Valida que un pedido tenga al menos un producto
 */
export const validatePedidoItems = (items: PedidoItem[]): boolean => {
  return items.length > 0 && items.every(item => item.cantidad > 0);
};

