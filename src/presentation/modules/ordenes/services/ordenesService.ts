import * as api from '../../../../infrastructure/api/OrdenApi';
import type { Orden } from '../../../../domain/entities/Orden';

// Reutilizamos la API de infraestructura que ya maneja endpoints con slash
// y mapeos de respuesta -> dominio.
export const listOrdenes: () => Promise<Orden[]> = api.listOrdenes;
export const getOrden: (id: number) => Promise<Orden> = api.getOrden;
export const createOrden = async (payload: Partial<Orden>): Promise<Orden> => {
  return api.createOrden(payload);
};
export const updateOrden = async (id: number, payload: Partial<Orden>): Promise<Orden> => {
  return api.updateOrden(id, payload);
};
export const deleteOrden: (id: number) => Promise<void> = api.deleteOrden;

export const listOrdenesDetailed = async () => {
  try {
    const ordenes = await listOrdenes();
    return { valid: ordenes, invalid: [] };
  } catch (error) {
    console.error('Error al cargar órdenes:', error);
    return { valid: [], invalid: [error] };
  }
};

// ========= Flujo de checkout =========
export type CartItem = {
  id_producto: number;
  nombre?: string;
  precio_unitario: number;
  cantidad: number;
};

export async function checkoutOrden(
  cabecera: Omit<Orden, 'id_orden' | 'total_orden' | 'created_at' | 'updated_at'>,
  items: CartItem[],
  metodo_pago: string,
) {
  if (!items.length) throw new Error('La orden no tiene ítems.');

  // 1) Crear orden
  const orden = await api.createOrden({
    id_cliente: cabecera.id_cliente,
    fecha_orden: cabecera.fecha_orden ?? new Date().toISOString(),
    estado_orden: cabecera.estado_orden ?? 'Pendiente',
    direccion_envio: cabecera.direccion_envio ?? '',
    ciudad_envio: cabecera.ciudad_envio ?? '',
    codigo_postal_envio: cabecera.codigo_postal_envio ?? '',
    pais_envio: cabecera.pais_envio ?? '',
    metodo_envio: cabecera.metodo_envio ?? '',
    costo_envio: cabecera.costo_envio ?? 0,
    estado_envio: cabecera.estado_envio ?? '',
  });

  // 2) Agregar ítems
  for (const it of items) {
    await api.addOrdenItem({
      id_producto: it.id_producto,
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
      id_orden: orden.id_orden,
    });
  }

  // 3) Confirmar venta
  const total = items.reduce((acc, it) => acc + it.cantidad * it.precio_unitario, 0);
  const venta = await api.confirmVenta({
    id_orden: orden.id_orden,
    fecha_venta: new Date().toISOString(),
    total_venta: Number(total.toFixed(2)),
    metodo_pago,
  });

  return { orden, venta } as const;
}