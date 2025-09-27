import { useState, useCallback } from 'react';
import * as service from '../services/productosService';
import type { Producto } from '../../../../domain/entities';

export function useProductos() {
  const [items, setItems] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.listProductos();
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
      await service.deleteProducto(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      throw err; // Re-lanzar para que el componente pueda manejar el error
    } finally {
      setLoading(false);
    }
  }, [load]);

  return { items, loading, error, load, remove } as const;
}
