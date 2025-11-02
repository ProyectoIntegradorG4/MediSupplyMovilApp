/**
 * Acciones de Clientes
 * 
 * Funciones para obtener y gestionar clientes institucionales
 * Todas las peticiones van a través del API Gateway
 * 
 * @module core/clientes/actions/clientes-actions
 */

import { 
  getClientes, 
  getClienteById, 
  getTiposInstitucion,
  formatClientesError
} from '../api/clientesApi';
import { 
  Cliente, 
  ClientesFilter, 
  TipoInstitucion 
} from '../interface/cliente';

/**
 * Obtiene la lista de clientes con filtros
 * 
 * @param filters Filtros opcionales
 * @returns Objeto con total, página, límite y array de clientes
 */
export const fetchClientes = async (filters?: ClientesFilter) => {
  try {
    console.log('📋 [Actions] Obteniendo clientes con filtros:', filters);
    const data = await getClientes(filters);
    console.log(`✅ [Actions] Clientes obtenidos: ${data.total} (página ${data.page})`);
    return data;
  } catch (error) {
    console.error('❌ [Actions] Error al obtener clientes:', error);
    const errorMessage = formatClientesError(error);
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene el detalle completo de un cliente
 * 
 * @param clienteId ID del cliente
 * @returns Información completa del cliente
 */
export const fetchClienteDetail = async (clienteId: number): Promise<Cliente> => {
  try {
    console.log(`📋 [Actions] Obteniendo detalle del cliente ${clienteId}`);
    const data = await getClienteById(clienteId);
    console.log(`✅ [Actions] Cliente ${clienteId} obtenido: ${data.nombre_comercial}`);
    return data;
  } catch (error) {
    console.error(`❌ [Actions] Error al obtener cliente ${clienteId}:`, error);
    const errorMessage = formatClientesError(error);
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene los tipos de institución disponibles para filtros
 * 
 * @returns Array de tipos de institución
 */
export const fetchTiposInstitucion = async (): Promise<TipoInstitucion[]> => {
  try {
    console.log('📋 [Actions] Obteniendo tipos de institución');
    const data = await getTiposInstitucion();
    console.log(`✅ [Actions] Tipos obtenidos: ${data.tipos.length}`);
    return data.tipos;
  } catch (error) {
    console.error('❌ [Actions] Error al obtener tipos:', error);
    const errorMessage = formatClientesError(error);
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene los clientes asignados a un gerente específico
 * 
 * @param gerenteId ID del gerente de cuenta
 * @param additionalFilters Filtros adicionales opcionales
 * @returns Lista de clientes asignados al gerente
 */
export const fetchClientesDeGerente = async (
  gerenteId: number,
  additionalFilters?: Omit<ClientesFilter, 'gerente_id'>
) => {
  try {
    console.log(`📋 [Actions] Obteniendo clientes del gerente ${gerenteId}`);
    
    const filters: ClientesFilter = {
      gerente_id: gerenteId,
      activo: true, // Por defecto, solo clientes activos
      ...additionalFilters
    };
    
    const data = await getClientes(filters);
    console.log(`✅ [Actions] Gerente ${gerenteId} tiene ${data.total} clientes asignados`);
    return data;
  } catch (error) {
    console.error(`❌ [Actions] Error al obtener clientes del gerente ${gerenteId}:`, error);
    const errorMessage = formatClientesError(error);
    throw new Error(errorMessage);
  }
};

