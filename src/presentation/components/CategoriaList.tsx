import { useState, useEffect } from 'react';
import { listCategorias } from '../../infrastructure/api/CategoriaApi';
import type { Categoria } from '../../domain/entities';

const CategoriaList = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await listCategorias();
        setCategorias(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  if (loading) {
    return <div className="p-4">Cargando categorías...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Categorías</h2>
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
                <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                  Editar
                </button>
                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
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