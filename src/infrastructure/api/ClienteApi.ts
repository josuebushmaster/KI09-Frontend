import { http } from './http';
import type { Cliente } from '../../domain/entities';

type ApiCliente = {
  id_cliente?: number;
  nombre?: string;
  nombre_cliente?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  apellido?: string;
  edad?: number;
  created_at?: string;
  updated_at?: string;
};

function toDomain(api: ApiCliente): Cliente | null {
  const rawId = api.id_cliente ?? api.id_cliente;
  if (rawId === undefined || rawId === null) return null;
  const id = Number(rawId);
  if (!Number.isFinite(id)) return null;

  const domain: Cliente = {
    id_cliente: id,
    nombre: String(api.nombre_cliente ?? api.nombre ?? '').trim(),
    email: api.email,
    telefono: api.telefono,
    direccion: api.direccion,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
  if (api.apellido !== undefined) domain.apellido = String(api.apellido).trim();
  if (api.edad !== undefined && Number.isFinite(api.edad)) domain.edad = Number(api.edad);
  return domain;
}

function toApi(payload: Partial<Cliente>): Partial<ApiCliente> {
  const out: Partial<ApiCliente> = {};
  if (payload.nombre !== undefined) out.nombre = payload.nombre;
  if (payload.email !== undefined) out.email = payload.email;
  if (payload.telefono !== undefined) out.telefono = payload.telefono;
  if (payload.direccion !== undefined) out.direccion = payload.direccion;
  if (payload.apellido !== undefined) out.apellido = payload.apellido;
  if (payload.edad !== undefined) out.edad = payload.edad;
  return out;
}

export async function listClientes(): Promise<Cliente[]> {
  const data = await http<ApiCliente[]>('clientes/');
  if (!Array.isArray(data)) return [];
  const mapped = data.map(toDomain).filter((x): x is Cliente => x !== null);
  if (mapped.length !== data.length) {
    console.warn('Algunos clientes devueltos por la API no tenían id_cliente válido y fueron ignorados', data);
  }
  return mapped;
}

export async function getCliente(id: number): Promise<Cliente> {
  const data = await http<ApiCliente>(`clientes/${id}`);
  const dom = toDomain(data);
  if (!dom) throw new Error('La API devolvió un cliente sin id_cliente válido');
  return dom;
}

export async function createCliente(payload: Partial<Cliente>): Promise<Cliente> {
  const apiPayload = toApi(payload);
  const data = await http<ApiCliente>('clientes/', 'POST', apiPayload);
  const dom = toDomain(data);
  if (!dom) throw new Error('La API devolvió un cliente creado sin id_cliente válido');
  return dom;
}

export async function updateCliente(id: number, payload: Partial<Cliente>): Promise<Cliente> {
  const apiPayload = toApi(payload);
  const data = await http<ApiCliente>(`clientes/${id}`, 'PUT', apiPayload);
  const dom = toDomain(data);
  if (!dom) throw new Error('La API devolvió un cliente actualizado sin id_cliente válido');
  return dom;
}

export async function deleteCliente(id: number): Promise<void> {
  await http<void>(`clientes/${id}`, 'DELETE');
}

export default {};
