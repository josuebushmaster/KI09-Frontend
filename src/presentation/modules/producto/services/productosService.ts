import * as api from '../../../../infrastructure/api/ProductoApi';
import type { Producto } from '../../../../domain/entities';

export const listProductos = api.listProductos;
export const getProducto = api.getProducto;
export const updateProducto = api.updateProducto;
export const deleteProducto = api.deleteProducto;

export async function createProducto(payload: Partial<Producto>): Promise<Producto> {
  // Sanitizar payload para evitar enviar campos de id accidentalmente
  const sanitized: Partial<Producto> = {
    nombre: payload.nombre,
    descripcion: payload.descripcion ?? null,
    precio: payload.precio,
    stock: payload.stock,
    id_categoria: payload.id_categoria,
  };
  return api.createProducto(sanitized);
}

export default { listProductos, getProducto, createProducto, updateProducto, deleteProducto };
