import { useState, useCallback } from 'react';
import * as service from '../services/categoriasService';
import type { Categoria } from '../../../../domain/entities';

export function useCategorias() {
  const [items, setItems] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.listCategorias();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await service.deleteCategoria(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  }, [load]);

  return { items, loading, error, load, remove } as const;
}
