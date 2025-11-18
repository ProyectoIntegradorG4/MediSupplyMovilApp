/**
 * Acciones de Rutas de Visitas
 * 
 * Funciones para obtener y gestionar rutas de visitas
 * Todas las peticiones van a través del API Gateway
 * 
 * @module core/rutas/actions/rutas-actions
 */

import { getRutasVisitas, formatRutasError } from '../api/rutasApi';
import { RutaDeVisitas } from '../interface/ruta';

/**
 * Obtiene la ruta de visitas para un gerente en una fecha específica
 * 
 * @param gerenteId ID del gerente de cuenta (número)
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns Ruta de visitas con listado ordenado
 * @throws Error con mensaje formateado si falla
 */
export const fetchRutaVisitas = async (
  gerenteId: number, 
  fecha: string
): Promise<RutaDeVisitas> => {
  try {
    console.log(`📋 [Actions] Obteniendo ruta de visitas para gerente ${gerenteId} en fecha ${fecha}`);
    
    const data = await getRutasVisitas({
      gerente_id: gerenteId,
      fecha: fecha
    });
    
    console.log(`✅ [Actions] Ruta obtenida: ${data.cantidad_visitas} visitas`);
    return data;
  } catch (error) {
    console.error('❌ [Actions] Error al obtener ruta de visitas:', error);
    const errorMessage = formatRutasError(error);
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene la ruta de visitas usando el ID del usuario (string) y lo convierte a número
 * Utilidad para trabajar directamente con el user.id del AuthStore
 * 
 * @param userId ID del usuario como string (del auth store)
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns Ruta de visitas con listado ordenado
 * @throws Error si el userId no es un número válido o si falla la petición
 */
export const fetchRutaVisitasByUserId = async (
  userId: string,
  fecha: string
): Promise<RutaDeVisitas> => {
  const gerenteId = parseInt(userId, 10);
  
  if (isNaN(gerenteId)) {
    throw new Error('ID de usuario inválido');
  }
  
  return fetchRutaVisitas(gerenteId, fecha);
};

