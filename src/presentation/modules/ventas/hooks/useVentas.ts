import { useCallback, useState } from 'react';
import * as service from '../services/ventasService';
import type { Venta } from '../../../../domain/entities';

export function useVentas() {
  const [items, setItems] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.listVentas();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await service.deleteVenta(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar venta');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [load]);

  return { items, loading, error, load, remove } as const;
}

export default {};
