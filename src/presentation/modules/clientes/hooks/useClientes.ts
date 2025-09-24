import { useState, useCallback } from 'react';
import * as service from '../services/clientesService';
import type { Cliente } from '../../../../domain/entities';

export function useClientes() {
  const [items, setItems] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.listClientes();
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
      await service.deleteCliente(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  }, [load]);

  return { items, loading, error, load, remove } as const;
}
