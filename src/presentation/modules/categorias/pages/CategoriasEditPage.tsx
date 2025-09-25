import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CategoriaForm from '../components/CategoriaForm';
import { getCategoria, updateCategoria } from '../services/categoriasService';
import type { Categoria } from '../../../../domain/entities';
import FormPageLayout from '../../shared/FormPageLayout';

const CategoriasEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const parsed = Number(id);
    if (!Number.isFinite(parsed)) {
      console.error('Invalid id param:', id);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await getCategoria(parsed);
        setCategoria(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (payload: Partial<Categoria>) => {
    if (!id) return;
    await updateCategoria(Number(id), payload);
    navigate('/categorias');
  };

  if (loading) return <div className="p-4">Cargando categoria...</div>;
  if (!categoria) return <div className="p-4 text-red-500">Categoría no encontrada</div>;

  return (
    <FormPageLayout
      title="Editar Categoría"
      subtitle="Ajusta los datos de la categoría y guarda los cambios."
      backTo="/categorias"
    >
      <CategoriaForm initial={categoria} onSubmit={handleSubmit} submitLabel="Actualizar" />
    </FormPageLayout>
  );
};

export default CategoriasEditPage;
