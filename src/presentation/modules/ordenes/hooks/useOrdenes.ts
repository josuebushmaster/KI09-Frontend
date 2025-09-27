import { useState, useCallback } from 'react';
import * as service from '../services/ordenesService';
import type { Orden } from '../../../../domain/entities';

export function useOrdenes() {
  const [items, setItems] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.listOrdenes();
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar ordenes';
      setError(message);
      console.error('Error loading ordenes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (ordenData: Omit<Orden, 'id_orden' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      await service.createOrden(ordenData);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear orden';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [load]);

  const update = useCallback(async (id: number, ordenData: Partial<Omit<Orden, 'id_orden' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    try {
      await service.updateOrden(id, ordenData);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar orden';
      setError(message);
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
      const message = err instanceof Error ? err.message : 'Error al eliminar orden';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [load]);

  return { items, loading, error, load, create, update, remove } as const;
}