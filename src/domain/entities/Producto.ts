export type Producto = {
  id_producto: number;
  nombre_producto: string;
  descripcion?: string | null;
  precio: number;
  costo?: number;
  stock?: number;
  id_categoria?: number;
  imagen_url?: string;
  created_at?: string;
  updated_at?: string;
};