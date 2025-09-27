import { http } from './http';
import type { OrdenProducto } from '../../domain/entities';

type ApiOrdenProducto = {
  id_ordenProd?: number;
  id_orden?: number;
  id_producto?: number;
  cantidad?: number;
  precio_unitario?: number;
  created_at?: string;
  updated_at?: string;
};

function toDomain(api: ApiOrdenProducto): OrdenProducto {
  return {
    id_ordenProd: api.id_ordenProd ?? 0,
    id_orden: api.id_orden ?? 0,
    id_producto: api.id_producto ?? 0,
    cantidad: api.cantidad ?? 0,
    precio_unitario: api.precio_unitario,
    created_at: api.created_at,
    updated_at: api.updated_at,
  } as OrdenProducto;
}

function toApi(payload: Partial<OrdenProducto>): Partial<ApiOrdenProducto> {
  const out: Partial<ApiOrdenProducto> = {};
  if (payload.id_orden !== undefined) out.id_orden = payload.id_orden;
  if (payload.id_producto !== undefined) out.id_producto = payload.id_producto;
  if (payload.cantidad !== undefined) out.cantidad = payload.cantidad;
  if (payload.precio_unitario !== undefined) out.precio_unitario = payload.precio_unitario;
  return out;
}

export async function listOrdenProductos(): Promise<OrdenProducto[]> {
  const data = await http<ApiOrdenProducto[]>('orden-producto/');
  return Array.isArray(data) ? data.map(toDomain) : [];
}

export async function getOrdenProducto(id: number): Promise<OrdenProducto> {
  const data = await http<ApiOrdenProducto>(`orden-producto/${id}`);
  return toDomain(data);
}

export async function createOrdenProducto(payload: Partial<OrdenProducto>): Promise<OrdenProducto> {
  const apiPayload = toApi(payload);
  const data = await http<ApiOrdenProducto>('orden-producto/', 'POST', apiPayload);
  return toDomain(data);
}

export async function updateOrdenProducto(id: number, payload: Partial<OrdenProducto>): Promise<OrdenProducto> {
  const apiPayload = toApi(payload);
  const data = await http<ApiOrdenProducto>(`orden-producto/${id}`, 'PUT', apiPayload);
  return toDomain(data);
}

export async function deleteOrdenProducto(id: number): Promise<void> {
  await http<void>(`orden-producto/${id}`, 'DELETE');
}

// Listar ítems por orden: GET /orden-producto/orden/{id_orden}
export async function listOrdenProductosByOrden(id_orden: number): Promise<OrdenProducto[]> {
  const data = await http<ApiOrdenProducto[]>(`orden-producto/orden/${id_orden}`);
  return Array.isArray(data) ? data.map(toDomain) : [];
}

export default {};
