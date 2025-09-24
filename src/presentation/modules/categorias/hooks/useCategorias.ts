import { useState, useCallback } from 'react';
import * as service from '../services/categoriasService';
import type { Categoria } from '../../../../domain/entities';

export function useCategorias() {
  const [items, setItems] = useState<Categoria[]>([]);
  const [invalid, setInvalid] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
  const data = await service.listCategoriasDetailed();
  setItems(data.valid);
  setInvalid(data.invalid);
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
      // Re-throw so callers (UI) can show context-specific error messages
      throw err;
    } finally {
      setLoading(false);
    }
  }, [load]);

  return { items, invalid, loading, error, load, remove } as const;
}
