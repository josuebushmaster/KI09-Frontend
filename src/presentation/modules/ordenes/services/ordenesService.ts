import { http } from '../../../../infrastructure/api/http';
import type { Orden } from '../../../../domain/entities/Orden';

const ENDPOINT = '/ordenes';

export const listOrdenes = async (): Promise<Orden[]> => {
  return await http<Orden[]>(ENDPOINT, 'GET');
};

export const listOrdenesDetailed = async () => {
  try {
    const ordenes = await listOrdenes();
    return { valid: ordenes, invalid: [] };
  } catch (error) {
    console.error('Error al cargar órdenes:', error);
    return { valid: [], invalid: [error] };
  }
};

export const getOrden = async (id: number): Promise<Orden> => {
  return await http<Orden>(`${ENDPOINT}/${id}`, 'GET');
};

export const createOrden = async (orden: Omit<Orden, 'id_orden' | 'created_at' | 'updated_at'>): Promise<Orden> => {
  return await http<Orden>(ENDPOINT, 'POST', orden);
};

export const updateOrden = async (id: number, orden: Partial<Omit<Orden, 'id_orden' | 'created_at' | 'updated_at'>>): Promise<Orden> => {
  return await http<Orden>(`${ENDPOINT}/${id}`, 'PUT', orden);
};

export const deleteOrden = async (id: number): Promise<void> => {
  await http<void>(`${ENDPOINT}/${id}`, 'DELETE');
};