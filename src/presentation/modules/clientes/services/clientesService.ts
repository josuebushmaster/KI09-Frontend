import * as api from '../../../../infrastructure/api/ClienteApi';
import type { Cliente } from '../../../../domain/entities';

export const listClientes = api.listClientes;
export const getCliente = api.getCliente;
export const updateCliente = api.updateCliente;
export const deleteCliente = api.deleteCliente;

export async function createCliente(payload: Partial<Cliente>): Promise<Cliente> {
  // Sanitizar payload para evitar enviar campos de id accidentalmente
  const sanitized: Partial<Cliente> = {
    nombre: payload.nombre,
    email: payload.email,
    telefono: payload.telefono,
    direccion: payload.direccion,
  };
  return api.createCliente(sanitized);
}

export default { listClientes, getCliente, createCliente, updateCliente, deleteCliente };
