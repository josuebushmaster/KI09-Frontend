export type Producto = {
  id_producto: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock?: number;
  id_categoria?: number;
  created_at?: string;
  updated_at?: string;
};