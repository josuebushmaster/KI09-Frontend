import { useCallback, useState } from 'react';
import * as api from '../../../../infrastructure/api/OrdenProductoApi';
import type { OrdenProducto } from '../../../../domain/entities';

export function useOrdenItems() {
  const [items, setItems] = useState<OrdenProducto[]>([]);
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
      setItems(prev => [...prev, created]);
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
      setItems(prev => prev.map(p => (p.id_ordenProd === id ? updated : p)));
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
      await api.deleteOrdenProducto(id);
      setItems(prev => prev.filter(p => p.id_ordenProd !== id));
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
