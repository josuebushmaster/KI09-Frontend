import { useNavigate } from 'react-router-dom';
import CategoriaForm from '../components/CategoriaForm';
import { createCategoria } from '../services/categoriasService';
import type { Categoria } from '../../../../domain/entities';
import { useStatus } from '../../../core';

const CategoriasCreatePage = () => {
  const navigate = useNavigate();
  const { show } = useStatus();

  const handleSubmit = async (payload: Partial<Categoria>) => {
    try {
      await createCategoria(payload);
      navigate('/categorias');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Try to extract payload/detail from known http error shape
      let detail: unknown = undefined;
      if (err && typeof err === 'object') {
        const rec = err as Record<string, unknown>;
        if ('payload' in rec) detail = rec['payload'];
        else if ('response' in rec && rec['response'] && typeof rec['response'] === 'object') {
          const r = rec['response'] as Record<string, unknown>;
          if ('data' in r) detail = r['data'];
          else detail = r;
        }
      }
      show({ title: 'Error al crear categoría', message: message, detail, variant: 'error' });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Categoría</h1>
      <CategoriaForm onSubmit={handleSubmit} submitLabel="Crear" />
    </div>
  );
};

export default CategoriasCreatePage;
