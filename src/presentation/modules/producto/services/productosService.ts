import * as api from '../../../../infrastructure/api/ProductoApi';
import type { Producto } from '../../../../domain/entities';

export const listProductos = api.listProductos;
export const getProducto = api.getProducto;
export const updateProducto = api.updateProducto;
export const deleteProducto = api.deleteProducto;

export async function createProducto(payload: Partial<Producto>): Promise<Producto> {
  // Sanitizar payload para evitar enviar campos de id accidentalmente
  const sanitized: Partial<Producto> = {
    nombre_producto: payload.nombre_producto,
    descripcion: payload.descripcion ?? null,
    precio: payload.precio,
    costo: payload.costo,
    stock: payload.stock,
    id_categoria: payload.id_categoria,
    imagen_url: payload.imagen_url,
  };
  return api.createProducto(sanitized);
}

export default { listProductos, getProducto, createProducto, updateProducto, deleteProducto };
