import { http } from './http';
import type { OrdenProducto } from '../../domain/entities';

type ApiOrdenProducto = {
  _id_ordenProd?: number;
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
    id_ordenProd: api._id_ordenProd ?? api.id_ordenProd ?? 0,
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
  const data = await http<ApiOrdenProducto[]>('ordenproductos/');
  return Array.isArray(data) ? data.map(toDomain) : [];
}

export async function getOrdenProducto(id: number): Promise<OrdenProducto> {
  const data = await http<ApiOrdenProducto>(`ordenproductos/${id}`);
  return toDomain(data);
}

export async function createOrdenProducto(payload: Partial<OrdenProducto>): Promise<OrdenProducto> {
  const apiPayload = toApi(payload);
  const data = await http<ApiOrdenProducto>('ordenproductos/', 'POST', apiPayload);
  return toDomain(data);
}

export async function updateOrdenProducto(id: number, payload: Partial<OrdenProducto>): Promise<OrdenProducto> {
  const apiPayload = toApi(payload);
  const data = await http<ApiOrdenProducto>(`ordenproductos/${id}`, 'PUT', apiPayload);
  return toDomain(data);
}

export async function deleteOrdenProducto(id: number): Promise<void> {
  await http<void>(`ordenproductos/${id}`, 'DELETE');
}

export default {};
