import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CategoriaForm from '../components/CategoriaForm';
import { getCategoria, updateCategoria } from '../services/categoriasService';
import type { Categoria } from '../../../../domain/entities';

const CategoriasEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getCategoria(Number(id));
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Categoría</h1>
      <CategoriaForm initial={categoria} onSubmit={handleSubmit} submitLabel="Actualizar" />
    </div>
  );
};

export default CategoriasEditPage;
