import * as api from '../../../../infrastructure/api/ProductoApi';
export const listProductos = api.listProductos;
export const getProducto = api.getProducto;
export const createProducto = api.createProducto;
export const updateProducto = api.updateProducto;
export const deleteProducto = api.deleteProducto;

export default { listProductos, getProducto, createProducto, updateProducto, deleteProducto };
