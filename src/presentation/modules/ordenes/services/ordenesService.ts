import * as api from '../../../../infrastructure/api/OrdenApi';
import type { Orden } from '../../../../domain/entities/Orden';

// Reutilizamos la API de infraestructura que ya maneja endpoints con slash
// y mapeos de respuesta -> dominio.
export const listOrdenes: () => Promise<Orden[]> = api.listOrdenes;
export const getOrden: (id: number) => Promise<Orden> = api.getOrden;
export const createOrden = async (payload: Partial<Orden>): Promise<Orden> => {
  return api.createOrden(payload);
};
export const updateOrden = async (id: number, payload: Partial<Orden>): Promise<Orden> => {
  return api.updateOrden(id, payload);
};
export const deleteOrden: (id: number) => Promise<void> = api.deleteOrden;

export const listOrdenesDetailed = async () => {
  try {
    const ordenes = await listOrdenes();
    return { valid: ordenes, invalid: [] };
  } catch (error) {
    console.error('Error al cargar órdenes:', error);
    return { valid: [], invalid: [error] };
  }
};