import { http } from './http';
import type { Orden } from '../../domain/entities';

type ApiOrden = {
  _id_orden?: number;
  id_orden?: number;
  id_cliente?: number;
  total?: number;
  estado?: string;
  created_at?: string;
  updated_at?: string;
};

function toDomain(api: ApiOrden): Orden {
  return {
    id_orden: api._id_orden ?? api.id_orden ?? 0,
    id_cliente: api.id_cliente ?? 0,
    total: api.total,
    estado: api.estado,
    created_at: api.created_at,
    updated_at: api.updated_at,
  } as Orden;
}

function toApi(payload: Partial<Orden>): Partial<ApiOrden> {
  const out: Partial<ApiOrden> = {};
  if (payload.id_cliente !== undefined) out.id_cliente = payload.id_cliente;
  if (payload.total !== undefined) out.total = payload.total;
  if (payload.estado !== undefined) out.estado = payload.estado;
  return out;
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
  const apiPayload = toApi(payload);
  const data = await http<ApiOrden>('ordenes/', 'POST', apiPayload);
  return toDomain(data);
}

export async function updateOrden(id: number, payload: Partial<Orden>): Promise<Orden> {
  const apiPayload = toApi(payload);
  const data = await http<ApiOrden>(`ordenes/${id}`, 'PUT', apiPayload);
  return toDomain(data);
}

export async function deleteOrden(id: number): Promise<void> {
  await http<void>(`ordenes/${id}`, 'DELETE');
}

export default {};
