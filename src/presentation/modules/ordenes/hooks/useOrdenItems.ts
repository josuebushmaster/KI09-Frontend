import { useCallback, useState, useRef, useEffect } from 'react';
import * as api from '../../../../infrastructure/api/OrdenProductoApi';
import * as ordenApi from '../../../../infrastructure/api/OrdenApi';
import type { OrdenProducto } from '../../../../domain/entities';

export function useOrdenItems() {
  const [items, setItems] = useState<OrdenProducto[]>([]);
  const itemsRef = useRef<OrdenProducto[]>(items);

  useEffect(() => { itemsRef.current = items; }, [items]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadByOrden = useCallback(async (id_orden: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listOrdenProductosByOrden(id_orden);
      setItems(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar ítems';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Partial<OrdenProducto>) => {
    setLoading(true);
    try {
      const created = await api.createOrdenProducto(payload);
      // Refresh items for the order and update header total when possible
      const idOrden = created.id_orden;
      if (idOrden) {
        const all = await api.listOrdenProductosByOrden(idOrden);
        setItems(all);
        const total = all.reduce((s, it) => s + (it.precio_unitario || 0) * (it.cantidad || 0), 0);
        try { await ordenApi.updateOrden(idOrden, { total_orden: Number(total.toFixed(2)) }); } catch (e) { console.warn('No se pudo actualizar total de orden tras crear ítem', e); }
      } else {
        setItems(prev => [...prev, created]);
      }
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear ítem';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, payload: Partial<OrdenProducto>) => {
    setLoading(true);
    try {
      const updated = await api.updateOrdenProducto(id, payload);
      // Refresh items for the order and update header total when possible
      const idOrden = updated.id_orden;
      if (idOrden) {
        const all = await api.listOrdenProductosByOrden(idOrden);
        setItems(all);
        const total = all.reduce((s, it) => s + (it.precio_unitario || 0) * (it.cantidad || 0), 0);
        try { await ordenApi.updateOrden(idOrden, { total_orden: Number(total.toFixed(2)) }); } catch (e) { console.warn('No se pudo actualizar total de orden tras actualizar ítem', e); }
      } else {
        setItems(prev => prev.map(p => (p.id_ordenProd === id ? updated : p)));
      }
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar ítem';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    try {
  // capture the order id from current items before deleting so we can refresh header total
  const target = itemsRef.current.find(p => p.id_ordenProd === id);
      const idOrden = target?.id_orden;
      await api.deleteOrdenProducto(id);
      if (idOrden) {
        const all = await api.listOrdenProductosByOrden(idOrden);
        setItems(all);
        const total = all.reduce((s, it) => s + (it.precio_unitario || 0) * (it.cantidad || 0), 0);
        try { await ordenApi.updateOrden(idOrden, { total_orden: Number(total.toFixed(2)) }); } catch (e) { console.warn('No se pudo actualizar total de orden tras eliminar ítem', e); }
      } else {
        setItems(prev => prev.filter(p => p.id_ordenProd !== id));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar ítem';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, loading, error, loadByOrden, create, update, remove, setItems } as const;
}

export default {};
