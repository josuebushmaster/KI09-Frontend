import { useState, useCallback } from 'react';
import * as service from '../services/ordenesService';
import type { Orden } from '../../../../domain/entities';

export function useOrdenes() {
  const [items, setItems] = useState<Orden[]>([]);
  const [invalid, setInvalid] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.listOrdenesDetailed();
      setItems(data.valid);
      setInvalid(data.invalid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (ordenData: Omit<Orden, 'id_orden' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const newOrden = await service.createOrden(ordenData);
      await load(); // Recargar la lista
      return newOrden;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear orden');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [load]);

  const update = useCallback(async (id: number, ordenData: Partial<Omit<Orden, 'id_orden' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    try {
      const updatedOrden = await service.updateOrden(id, ordenData);
      await load(); // Recargar la lista
      return updatedOrden;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar orden');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [load]);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await service.deleteOrden(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      // Re-throw so callers (UI) can show context-specific error messages
      throw err;
    } finally {
      setLoading(false);
    }
  }, [load]);

  return { items, invalid, loading, error, load, create, update, remove } as const;
}