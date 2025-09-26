export type Orden = {
  id_orden: number;
  id_cliente: number;
  fecha_orden: string;
  estado_orden: string;
  direccion_envio: string;
  total_orden: number;
  ciudad_envio: string;
  codigo_postal_envio: string;
  pais_envio: string;
  metodo_envio: string;
  costo_envio: number;
  estado_envio: string;
  created_at?: string;
  updated_at?: string;
};