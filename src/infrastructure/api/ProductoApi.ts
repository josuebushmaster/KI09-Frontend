import { http } from './http';
import type { Producto } from '../../domain/entities';

type ApiProducto = {
  _id_producto?: number;
  id_producto?: number;
  nombre_producto?: string;
  nombre?: string;
  descripcion?: string | null;
  descripcion_producto?: string | null;
  precio?: number;
  precio_producto?: number;
  stock?: number;
  existencia?: number;
  id_categoria?: number;
  categoria_id?: number;
  created_at?: string;
  updated_at?: string;
};

function toDomain(api: ApiProducto): Producto {
  return {
    id_producto: api._id_producto ?? api.id_producto ?? 0,
    nombre: api.nombre_producto ?? api.nombre ?? '',
    descripcion: api.descripcion ?? api.descripcion_producto ?? null,
    precio: api.precio ?? api.precio_producto ?? 0,
    stock: api.stock ?? api.existencia,
    id_categoria: api.id_categoria ?? api.categoria_id,
    created_at: api.created_at,
    updated_at: api.updated_at,
  } as Producto;
}

function toApi(payload: Partial<Producto>): Partial<ApiProducto> {
  const out: Partial<ApiProducto> = {};
  if (payload.nombre !== undefined) out.nombre_producto = payload.nombre;
  if (payload.descripcion !== undefined) out.descripcion = payload.descripcion;
  if (payload.precio !== undefined) out.precio = payload.precio;
  if (payload.stock !== undefined) out.stock = payload.stock;
  if (payload.id_categoria !== undefined) out.id_categoria = payload.id_categoria;
  return out;
}

export async function listProductos(): Promise<Producto[]> {
  const data = await http<ApiProducto[]>('productos/');
  // Debug in dev: log raw API response and mapped domain data
  try {
    if (import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('ProductoApi.raw', data);
      // eslint-disable-next-line no-console
      console.debug('ProductoApi.mapped', Array.isArray(data) ? data.map(toDomain) : []);
    }
  } catch (e) {
    // ignore
  }
  return Array.isArray(data) ? data.map(toDomain) : [];
}

export async function getProducto(id: number): Promise<Producto> {
  const data = await http<ApiProducto>(`productos/${id}`);
  return toDomain(data);
}

export async function createProducto(payload: Partial<Producto>): Promise<Producto> {
  const apiPayload = toApi(payload);
  const data = await http<ApiProducto>('productos/', 'POST', apiPayload);
  return toDomain(data);
}

export async function updateProducto(id: number, payload: Partial<Producto>): Promise<Producto> {
  const apiPayload = toApi(payload);
  const data = await http<ApiProducto>(`productos/${id}`, 'PUT', apiPayload);
  return toDomain(data);
}

export async function deleteProducto(id: number): Promise<void> {
  await http<void>(`productos/${id}`, 'DELETE');
}

export default {};
