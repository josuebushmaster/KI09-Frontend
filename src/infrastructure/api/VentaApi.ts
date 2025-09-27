import { http } from './http';
import type { Venta } from '../../domain/entities';

// Estructura que puede devolver el backend
type ApiVenta = {
  id_venta?: number;
  id_orden?: number;
  fecha_venta?: string;
  total_venta?: number;
  metodo_pago?: string;
  // compatibilidad por si el backend usa 'total'
  total?: number;
  created_at?: string;
  updated_at?: string;
};

function toDomain(api: ApiVenta): Venta {
  return {
    id_venta: Number(api.id_venta ?? 0),
    id_orden: Number(api.id_orden ?? 0),
    fecha_venta: api.fecha_venta ?? '',
    total_venta: (api.total_venta ?? api.total ?? 0) as number,
    metodo_pago: api.metodo_pago ?? '',
    created_at: api.created_at,
    updated_at: api.updated_at,
  } as Venta;
}

function toApi(payload: Partial<Venta>): Partial<ApiVenta> {
  const out: Partial<ApiVenta> = {};
  if (payload.id_orden !== undefined) out.id_orden = payload.id_orden;
  if (payload.fecha_venta !== undefined) out.fecha_venta = payload.fecha_venta;
  if (payload.total_venta !== undefined) out.total_venta = payload.total_venta;
  if (payload.metodo_pago !== undefined) out.metodo_pago = payload.metodo_pago;
  return out;
}

export async function listVentas(): Promise<Venta[]> {
  const data = await http<ApiVenta[]>('ventas/');
  return Array.isArray(data) ? data.map(toDomain) : [];
}

export async function getVenta(id: number): Promise<Venta> {
  const data = await http<ApiVenta>(`ventas/${id}`);
  return toDomain(data);
}

export async function createVenta(payload: Partial<Venta>): Promise<Venta> {
  const apiPayload = toApi(payload);
  const data = await http<ApiVenta>('ventas/', 'POST', apiPayload);
  return toDomain(data);
}

export async function updateVenta(id: number, payload: Partial<Venta>): Promise<Venta> {
  const apiPayload = toApi(payload);
  const data = await http<ApiVenta>(`ventas/${id}`, 'PUT', apiPayload);
  return toDomain(data);
}

export async function deleteVenta(id: number): Promise<void> {
  await http<void>(`ventas/${id}`, 'DELETE');
}

export default {};
