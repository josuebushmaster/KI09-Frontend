import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProductos } from '../hooks/useProductos';
import { useCategorias } from '../../categorias';

const ProductoList = () => {
  const { items: productos, loading, error, load } = useProductos();
  const { items: categorias, load: loadCategorias } = useCategorias();

  useEffect(() => {
    load();
    loadCategorias();
  }, [load, loadCategorias]);

  // Función para obtener nombre de categoría por ID
  const getCategoryName = (id_categoria?: number): string => {
    if (!id_categoria) return 'Sin categoría';
    
    const categoria = categorias.find(c => c.id_categoria === id_categoria);
    return categoria ? categoria.nombre : `Categoría ${id_categoria}`;
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Productos</h2>
        <Link to="/productos/create" className="bg-red-600 text-white px-4 py-2 rounded">
          Nuevo Producto
        </Link>
      </div>

      <div className="bg-white rounded border">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Producto</th>
              <th className="px-6 py-3 text-left">Categoría</th>
              <th className="px-6 py-3 text-right">Precio</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id_producto}>
                <td className="px-6 py-4">{producto.nombre_producto}</td>
                <td className="px-6 py-4">{getCategoryName(producto.id_categoria)}</td>
                <td className="px-6 py-4 text-right">${producto.precio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductoList;