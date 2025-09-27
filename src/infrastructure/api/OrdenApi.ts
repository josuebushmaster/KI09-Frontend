import { http } from './http';
import type { Orden } from '../../domain/entities';

// Estructura que expone el backend (según Swagger)
type ApiOrden = {
  id_orden?: number;
  id_cliente?: number;
  fecha_orden?: string;
  // Algunos backends usan 'estado' y pueden representar estados por id (number)
  estado_orden?: string | number; // aceptamos number para enviar enums como número
  estado?: string | number;
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

const ESTADO_DEFAULT = 'Pendiente';
const STATUS_LABEL_FROM_CODE: Record<number, string> = {
  1: 'Pendiente',
  2: 'Confirmada',
  3: 'Procesando',
  4: 'Completada',
  5: 'Cancelada',
};

const STATUS_CANONICAL: Record<string, string> = Object.values(STATUS_LABEL_FROM_CODE).reduce((acc, label) => {
  acc[label.toLowerCase()] = label;
  return acc;
}, {} as Record<string, string>);

function normalizeEstadoOrden(value: unknown): string {
  if (value === null || value === undefined) return ESTADO_DEFAULT;

  if (typeof value === 'number') {
    return STATUS_LABEL_FROM_CODE[value] ?? String(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return ESTADO_DEFAULT;
    const canonical = STATUS_CANONICAL[trimmed.toLowerCase()];
    return canonical ?? trimmed;
  }

  try {
    return String(value);
  } catch {
    return ESTADO_DEFAULT;
  }
}

function normalizeFechaOrden(value: unknown): string {
  const fallback = () => new Date().toISOString();

  if (!value) return fallback();

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback();
    // Si viene en formato YYYY-MM-DD convertirlo a ISO manteniendo medianoche UTC
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return `${trimmed}T00:00:00.000Z`;
    }
    // Si ya es ISO o similar, regresarlo tal cual
    return trimmed;
  }

  try {
    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime())) {
      return fallback();
    }
    return parsed.toISOString();
  } catch {
    return fallback();
  }
}

function ensureNumber(value: unknown, defaultValue = 0): number {
  const num = typeof value === 'number' ? value : Number(value ?? defaultValue);
  return Number.isFinite(num) ? num : defaultValue;
}

function toDomain(api: ApiOrden): Orden {
  return {
    id_orden: Number(api.id_orden ?? 0),
    id_cliente: Number(api.id_cliente ?? 0),
    fecha_orden: api.fecha_orden ?? '',
    estado_orden: normalizeEstadoOrden(api.estado_orden ?? api.estado),
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
  const asRecord = payload as Partial<Record<string, unknown>>;
  if (asRecord['id_orden'] !== undefined) out.id_orden = Number(asRecord['id_orden'] as number);
  if (payload.fecha_orden !== undefined) out.fecha_orden = normalizeFechaOrden(payload.fecha_orden);
  if (payload.estado_orden !== undefined) {
    const normalizedEstado = normalizeEstadoOrden(payload.estado_orden);
    const apiOut = out as ApiOrden & Record<string, unknown>;
    apiOut.estado_orden = normalizedEstado;
    apiOut.estado = normalizedEstado;
  }
  if (payload.direccion_envio !== undefined) {
    const trimmed = String(payload.direccion_envio ?? '').trim();
    if (trimmed) out.direccion_envio = trimmed;
  }
  if (payload.total_orden !== undefined) out.total_orden = ensureNumber(payload.total_orden);
  if (payload.ciudad_envio !== undefined) {
    const trimmed = String(payload.ciudad_envio ?? '').trim();
    if (trimmed) out.ciudad_envio = trimmed;
  }
  if (payload.codigo_postal_envio !== undefined) {
    const trimmed = String(payload.codigo_postal_envio ?? '').trim();
    if (trimmed) out.codigo_postal_envio = trimmed;
  }
  if (payload.pais_envio !== undefined) {
    const trimmed = String(payload.pais_envio ?? '').trim();
    if (trimmed) out.pais_envio = trimmed;
  }
  if (payload.metodo_envio !== undefined) {
    const trimmed = String(payload.metodo_envio ?? '').trim();
    if (trimmed) out.metodo_envio = trimmed;
  }
  if (payload.costo_envio !== undefined) out.costo_envio = ensureNumber(payload.costo_envio);
  if (payload.estado_envio !== undefined) {
    const trimmed = String(payload.estado_envio ?? '').trim();
    if (trimmed) out.estado_envio = trimmed;
  }
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
    if (typeof console !== 'undefined' && typeof console.debug === 'function') console.debug('OrdenApi.createOrden - payload:', apiPayload);
  // Use the plural endpoint for creation to match list endpoint and avoid 404s
  const data = await http<ApiOrden>('ordenes/', 'POST', apiPayload);
    return toDomain(data);
  } catch (e) {
    throw parseApiError(e);
  }
}

export async function updateOrden(id: number, payload: Partial<Orden>): Promise<Orden> {
  try {
    const apiPayload = toApi(payload);
    if (typeof console !== 'undefined' && typeof console.debug === 'function') console.debug(`OrdenApi.updateOrden ${id} - payload:`, apiPayload);
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
