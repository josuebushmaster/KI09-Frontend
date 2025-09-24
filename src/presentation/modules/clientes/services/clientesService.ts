import * as api from '../../../../infrastructure/api/ClienteApi';
export const listClientes = api.listClientes;
export const getCliente = api.getCliente;
export const createCliente = api.createCliente;
export const updateCliente = api.updateCliente;
export const deleteCliente = api.deleteCliente;

export default { listClientes, getCliente, createCliente, updateCliente, deleteCliente };
