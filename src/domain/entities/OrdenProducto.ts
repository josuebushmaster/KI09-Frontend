export type OrdenProducto = {
  id_ordenProd: number;
  id_orden: number;
  id_producto: number;
  cantidad: number;
  precio_unitario?: number;
  created_at?: string;
  updated_at?: string;
};