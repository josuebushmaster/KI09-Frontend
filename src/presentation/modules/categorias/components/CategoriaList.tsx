import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCategorias } from '../hooks/useCategorias';

const CategoriaList = () => {
  const { items: categorias, loading, error, load, remove } = useCategorias();
  const navigate = useNavigate();

  // load on mount
  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="p-4">Cargando categorías...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Lista de Categorías</h2>
        <Link to="/categorias/create" className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Crear categoría</Link>
      </div>
      {categorias.length === 0 ? (
        <p>No hay categorías disponibles.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categorias.map((categoria) => (
            <div key={categoria.id_categoria} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{categoria.nombre}</h3>
              <p className="text-gray-600 mt-2">
                {categoria.descripcion && String(categoria.descripcion).trim()
                  ? categoria.descripcion
                  : <span className="italic text-gray-400">Sin descripción</span>}
              </p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => navigate(`/categorias/${categoria.id_categoria}/edit`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('¿Eliminar esta categoría?')) return;
                    try {
                      await remove(categoria.id_categoria);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Error al eliminar');
                    }
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriaList;
