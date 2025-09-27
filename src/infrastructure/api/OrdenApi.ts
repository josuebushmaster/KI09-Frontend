import { http } from './http';
import type { Orden } from '../../domain/entities';

// Estructura que expone el backend (según Swagger)
type ApiOrden = {
  id_orden?: number;
  id_cliente?: number;
  fecha_orden?: string;
  estado_orden?: string; // algunos backends usan 'estado'
  estado?: string;
  direccion_envio?: string;
  total_orden?: number;  // algunos backends usan 'total'
  total?: number;
  ciudad_envio?: string;
  codigo_postal_envio?: string;
  pais_envio?: string;
  metodo_envio?: string;
  costo_envio?: number;
  estado_envio?: string;
  created_at?: string;
  updated_at?: string;
};

function toDomain(api: ApiOrden): Orden {
  return {
    id_orden: Number(api.id_orden ?? 0),
    id_cliente: Number(api.id_cliente ?? 0),
    fecha_orden: api.fecha_orden ?? '',
    estado_orden: api.estado_orden ?? api.estado ?? 'Pendiente',
    direccion_envio: api.direccion_envio ?? '',
    total_orden: (api.total_orden ?? api.total ?? 0) as number,
    ciudad_envio: api.ciudad_envio ?? '',
    codigo_postal_envio: api.codigo_postal_envio ?? '',
    pais_envio: api.pais_envio ?? '',
    metodo_envio: api.metodo_envio ?? '',
    costo_envio: api.costo_envio ?? 0,
    estado_envio: api.estado_envio ?? '',
    created_at: api.created_at,
    updated_at: api.updated_at,
  } as Orden;
}

function toApi(payload: Partial<Orden>): Partial<ApiOrden> {
  const out: Partial<ApiOrden> = {};
  if (payload.id_cliente !== undefined) out.id_cliente = payload.id_cliente;
  if (payload.fecha_orden !== undefined) out.fecha_orden = payload.fecha_orden;
  if (payload.estado_orden !== undefined) out.estado_orden = payload.estado_orden;
  if (payload.direccion_envio !== undefined) out.direccion_envio = payload.direccion_envio;
  if (payload.total_orden !== undefined) out.total_orden = payload.total_orden;
  if (payload.ciudad_envio !== undefined) out.ciudad_envio = payload.ciudad_envio;
  if (payload.codigo_postal_envio !== undefined) out.codigo_postal_envio = payload.codigo_postal_envio;
  if (payload.pais_envio !== undefined) out.pais_envio = payload.pais_envio;
  if (payload.metodo_envio !== undefined) out.metodo_envio = payload.metodo_envio;
  if (payload.costo_envio !== undefined) out.costo_envio = payload.costo_envio;
  if (payload.estado_envio !== undefined) out.estado_envio = payload.estado_envio;
  return out;
}

// Unificar manejo de errores extrayendo el campo `detail` del backend
function parseApiError(err: unknown): Error {
  try {
    const e = err as { detail?: unknown; message?: unknown; response?: { data?: { detail?: unknown } } } | undefined;
    const detail = e?.detail ?? e?.message ?? e?.response?.data?.detail ?? 'Error inesperado';
    return new Error(String(detail));
  } catch {
    return new Error('Error inesperado');
  }
}

export async function listOrdenes(): Promise<Orden[]> {
  const data = await http<ApiOrden[]>('ordenes/');
  return Array.isArray(data) ? data.map(toDomain) : [];
}

export async function getOrden(id: number): Promise<Orden> {
  const data = await http<ApiOrden>(`ordenes/${id}`);
  return toDomain(data);
}

export async function createOrden(payload: Partial<Orden>): Promise<Orden> {
  try {
    const apiPayload = toApi(payload);
    // Endpoint real para crear: POST /orden (singular)
    const data = await http<ApiOrden>('orden', 'POST', apiPayload);
    return toDomain(data);
  } catch (e) {
    throw parseApiError(e);
  }
}

export async function updateOrden(id: number, payload: Partial<Orden>): Promise<Orden> {
  try {
    const apiPayload = toApi(payload);
    const data = await http<ApiOrden>(`ordenes/${id}`, 'PUT', apiPayload);
    return toDomain(data);
  } catch (e) {
    throw parseApiError(e);
  }
}

export async function deleteOrden(id: number): Promise<void> {
  try {
    await http<void>(`ordenes/${id}`, 'DELETE');
  } catch (e) {
    throw parseApiError(e);
  }
}

// ===== Ítems de orden =====
export type OrdenProductoCreateDTO = {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  id_orden: number;
};

export type OrdenProductoResponseDTO = {
  id_ordenProd: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  id_orden: number;
};

// POST /orden-producto
export async function addOrdenItem(dto: OrdenProductoCreateDTO): Promise<OrdenProductoResponseDTO> {
  try {
    return await http<OrdenProductoResponseDTO>('orden-producto', 'POST', dto);
  } catch (e) {
    throw parseApiError(e);
  }
}

// ===== Ventas =====
export type VentaCreateDTO = {
  id_orden: number;
  fecha_venta: string;   // ISO
  total_venta: number;
  metodo_pago: string;
};

export type VentaResponseDTO = {
  id_venta: number;
  id_orden: number;
  fecha_venta: string;
  total_venta: number;
  metodo_pago: string;
};

// POST /ventas
export async function confirmVenta(dto: VentaCreateDTO): Promise<VentaResponseDTO> {
  try {
    return await http<VentaResponseDTO>('ventas', 'POST', dto);
  } catch (e) {
    throw parseApiError(e);
  }
}

export default {};
