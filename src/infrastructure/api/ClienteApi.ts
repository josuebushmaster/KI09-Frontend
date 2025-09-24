import { http } from './http';
import type { Cliente } from '../../domain/entities';

type ApiCliente = {
  _id_cliente?: number;
  id_cliente?: number;
  nombre?: string;
  nombre_cliente?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  created_at?: string;
  updated_at?: string;
};

function toDomain(api: ApiCliente): Cliente {
  return {
    id_cliente: api._id_cliente ?? api.id_cliente ?? 0,
    nombre: api.nombre_cliente ?? api.nombre ?? '',
    email: api.email,
    telefono: api.telefono,
    direccion: api.direccion,
    created_at: api.created_at,
    updated_at: api.updated_at,
  } as Cliente;
}

function toApi(payload: Partial<Cliente>): Partial<ApiCliente> {
  const out: Partial<ApiCliente> = {};
  if (payload.nombre !== undefined) out.nombre = payload.nombre;
  if (payload.email !== undefined) out.email = payload.email;
  if (payload.telefono !== undefined) out.telefono = payload.telefono;
  if (payload.direccion !== undefined) out.direccion = payload.direccion;
  return out;
}

export async function listClientes(): Promise<Cliente[]> {
  const data = await http<ApiCliente[]>('clientes/');
  return Array.isArray(data) ? data.map(toDomain) : [];
}

export async function getCliente(id: number): Promise<Cliente> {
  const data = await http<ApiCliente>(`clientes/${id}`);
  return toDomain(data);
}

export async function createCliente(payload: Partial<Cliente>): Promise<Cliente> {
  const apiPayload = toApi(payload);
  const data = await http<ApiCliente>('clientes/', 'POST', apiPayload);
  return toDomain(data);
}

export async function updateCliente(id: number, payload: Partial<Cliente>): Promise<Cliente> {
  const apiPayload = toApi(payload);
  const data = await http<ApiCliente>(`clientes/${id}`, 'PUT', apiPayload);
  return toDomain(data);
}

export async function deleteCliente(id: number): Promise<void> {
  await http<void>(`clientes/${id}`, 'DELETE');
}

export default {};
