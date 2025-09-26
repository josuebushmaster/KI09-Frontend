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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const parsed = Number(id);
    if (!Number.isFinite(parsed)) {
      console.error('Invalid id param:', id);
      setError('ID de categoría inválido');
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await getCategoria(parsed);
        setCategoria(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Error al cargar la categoría');
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

  if (loading) {
    return (
      <FormPageLayout
        title="Editar Categoría"
        subtitle="Cargando información de la categoría..."
        backTo="/categorias"
      >
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="text-sm text-gray-500">Cargando categoría...</p>
          </div>
        </div>
      </FormPageLayout>
    );
  }
  
  if (error || !categoria) {
    return (
      <FormPageLayout
        title="Error"
        subtitle={error || "Categoría no encontrada"}
        backTo="/categorias"
      >
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se pudo cargar la categoría</h3>
          <p className="text-gray-600">{error || "La categoría solicitada no existe."}</p>
        </div>
      </FormPageLayout>
    );
  }

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
