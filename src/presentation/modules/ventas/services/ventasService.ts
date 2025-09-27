import * as api from '../../../../infrastructure/api/VentaApi';
import type { Venta } from '../../../../domain/entities';

export const listVentas: () => Promise<Venta[]> = api.listVentas;
export const getVenta: (id: number) => Promise<Venta> = api.getVenta;
export const createVenta = async (payload: Partial<Venta>): Promise<Venta> => api.createVenta(payload);
export const updateVenta = async (id: number, payload: Partial<Venta>): Promise<Venta> => api.updateVenta(id, payload);
export const deleteVenta: (id: number) => Promise<void> = api.deleteVenta;

export default {};
