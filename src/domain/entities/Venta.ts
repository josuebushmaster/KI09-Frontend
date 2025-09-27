export type Venta = {
  id_venta: number;
  id_orden: number;
  fecha_venta: string;
  total_venta: number;
  metodo_pago: string;
  created_at?: string;
  updated_at?: string;
};