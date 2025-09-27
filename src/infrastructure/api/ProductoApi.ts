import { http } from './http';
import type { Producto } from '../../domain/entities';

type ApiProducto = {
  id_producto?: number;
  nombre_producto?: string;
  nombre?: string;
  descripcion?: string | null;
  descripcion_producto?: string | null;
  precio?: number;
  precio_producto?: number;
  costo?: number;
  stock?: number;
  existencia?: number;
  id_categoria?: number;
  categoria_id?: number;
  imagen_url?: string;
  created_at?: string;
  updated_at?: string;
};

function toDomain(api: ApiProducto): Producto | null {
  const rawId = api.id_producto;
  if (rawId === undefined || rawId === null) return null;
  const id = Number(rawId);
  if (!Number.isFinite(id)) return null;

  return {
    id_producto: id,
    nombre_producto: String(api.nombre_producto ?? api.nombre ?? '').trim(),
    descripcion: api.descripcion ?? api.descripcion_producto ?? null,
    precio: api.precio ?? api.precio_producto ?? 0,
    costo: api.costo,
    stock: api.stock ?? api.existencia,
    id_categoria: api.id_categoria ?? api.categoria_id,
    imagen_url: api.imagen_url,
    created_at: api.created_at,
    updated_at: api.updated_at,
  } as Producto;
}

function toApi(payload: Partial<Producto>): Partial<ApiProducto> {
  const out: Partial<ApiProducto> = {};
  // Send several common aliases to increase compatibility with different backends.
  // Some backends expect `nombre` / `precio_producto` / `categoria_id` instead of the
  // exact snake_case used here; include both variants when available.
  if (payload.nombre_producto !== undefined) {
    out.nombre_producto = payload.nombre_producto;
    out.nombre = payload.nombre_producto;
  }
  if (payload.descripcion !== undefined) {
    out.descripcion = payload.descripcion;
    out.descripcion_producto = payload.descripcion;
  }
  if (payload.precio !== undefined) {
    out.precio = payload.precio;
    out.precio_producto = payload.precio;
  }
  if (payload.costo !== undefined) out.costo = payload.costo;
  if (payload.stock !== undefined) {
    out.stock = payload.stock;
    out.existencia = payload.stock;
  }
  if (payload.id_categoria !== undefined) {
    out.id_categoria = payload.id_categoria;
    out.categoria_id = payload.id_categoria;
  }
  if (payload.imagen_url !== undefined) out.imagen_url = payload.imagen_url;
  return out;
}

export async function listProductos(signal?: AbortSignal): Promise<Producto[]> {
  const data = await http<ApiProducto[]>('productos/', 'GET', undefined, signal);
  if (!Array.isArray(data)) return [];
  const mapped = data.map(toDomain).filter((x): x is Producto => x !== null);
  if (mapped.length !== data.length) {
    console.warn('Algunos productos devueltos por la API no tenían id_producto válido y fueron ignorados', data);
  }
  return mapped;
}

export async function getProducto(id: number): Promise<Producto> {
  const data = await http<ApiProducto>(`productos/${id}`);
  const dom = toDomain(data);
  if (!dom) throw new Error('La API devolvió un producto sin id_producto válido');
  return dom;
}

export async function createProducto(payload: Partial<Producto>): Promise<Producto> {
  const apiPayload = toApi(payload);
  const data = await http<ApiProducto>('productos/', 'POST', apiPayload);
  const dom = toDomain(data);
  if (!dom) throw new Error('La API devolvió un producto creado sin id_producto válido');
  return dom;
}

export async function updateProducto(id: number, payload: Partial<Producto>): Promise<Producto> {
  const apiPayload = toApi(payload);
  const data = await http<ApiProducto>(`productos/${id}`, 'PUT', apiPayload);
  const dom = toDomain(data);
  if (!dom) throw new Error('La API devolvió un producto actualizado sin id_producto válido');
  return dom;
}

export async function deleteProducto(id: number): Promise<void> {
  await http<void>(`productos/${id}`, 'DELETE');
}

export default {};
