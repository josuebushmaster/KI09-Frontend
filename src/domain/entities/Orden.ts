export type Orden = {
  id_orden: number;
  id_cliente: number;
  total?: number;
  estado?: string;
  created_at?: string;
  updated_at?: string;
  // agrega campos extra si tu backend los devuelve
};