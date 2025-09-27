export type Cliente = {
  id_cliente: number;
  nombre: string;
  /** Apellido del cliente */
  apellido?: string;
  /** Edad del cliente */
  edad?: number;
  email?: string;
  telefono?: string;
  direccion?: string;
  created_at?: string;
  updated_at?: string;
};