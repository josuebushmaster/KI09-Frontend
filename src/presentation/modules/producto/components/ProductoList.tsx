import { useEffect, useState } from 'react';
import { useProductos } from '../hooks/useProductos';
import { ConfirmModal, useStatus } from '../../../core';

const ProductoList = () => {
  const { items: productos, loading, error, load, remove } = useProductos();
  const [pendingDelete, setPendingDelete] = useState<{ id: number; nombre?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { show } = useStatus();

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="p-4">Cargando productos...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Productos</h2>
      {productos.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {productos.map((p) => (
            <div key={p.id_producto} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{p.nombre}</h3>
              <p className="text-gray-600 mt-2">
                {p.descripcion && String(p.descripcion).trim() ? p.descripcion : <span className="italic text-gray-400">Sin descripción</span>}
              </p>
              <div className="mt-2 text-sm text-gray-700">Precio: {p.precio}</div>
              <div className="mt-4 flex space-x-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
                <button
                  onClick={() => setPendingDelete({ id: Number(p.id_producto), nombre: p.nombre })}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={`Eliminar producto${pendingDelete?.nombre ? `: ${pendingDelete.nombre}` : ''}`}
        description="Esta acción no se puede deshacer. ¿Deseas continuar?"
        confirmLabel="Sí, eliminar"
        cancelLabel="No, cancelar"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            setDeleting(true);
            await remove(pendingDelete.id);
            setPendingDelete(null);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            show({ title: 'Error al eliminar', message: `Error al eliminar: ${message}`, detail: err, variant: 'error' });
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
};

export default ProductoList;
