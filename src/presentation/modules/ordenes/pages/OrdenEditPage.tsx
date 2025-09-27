import { useEffect } from 'react';
import OrdenForm from '../components/OrdenForm';
import { useOrdenes } from '../hooks/useOrdenes';

const OrdenEditPage = () => {
  const { items, load } = useOrdenes();

  useEffect(() => {
    if (!items || items.length === 0) {
      load();
    }
  }, [items, load]);

  return <OrdenForm />;
};

export default OrdenEditPage;