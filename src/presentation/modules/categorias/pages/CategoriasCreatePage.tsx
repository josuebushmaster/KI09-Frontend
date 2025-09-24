import { useNavigate } from 'react-router-dom';
import CategoriaForm from '../components/CategoriaForm';
import { createCategoria } from '../services/categoriasService';
import type { Categoria } from '../../../../domain/entities';

const CategoriasCreatePage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (payload: Partial<Categoria>) => {
    await createCategoria(payload);
    navigate('/categorias');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Categoría</h1>
      <CategoriaForm onSubmit={handleSubmit} submitLabel="Crear" />
    </div>
  );
};

export default CategoriasCreatePage;
