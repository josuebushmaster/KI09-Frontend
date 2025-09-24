import { http } from './http';
import type { Venta } from '../../domain/entities';

type ApiVenta = {
  _id_venta?: number;
  id_venta?: number;
  id_orden?: number;
  total?: number;
  created_at?: string;
  updated_at?: string;
};

function toDomain(api: ApiVenta): Venta {
  return {
    id_venta: api._id_venta ?? api.id_venta ?? 0,
    id_orden: api.id_orden,
    total: api.total,
    created_at: api.created_at,
    updated_at: api.updated_at,
  } as Venta;
}

function toApi(payload: Partial<Venta>): Partial<ApiVenta> {
  const out: Partial<ApiVenta> = {};
  if (payload.id_orden !== undefined) out.id_orden = payload.id_orden;
  if (payload.total !== undefined) out.total = payload.total;
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
