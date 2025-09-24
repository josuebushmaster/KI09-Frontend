import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCategorias } from '../hooks/useCategorias';
import type { Categoria } from '../../../../domain/entities';
import ConfirmModal from '../../../core/components/ConfirmModal';
import { useStatus } from '../../../core/';

const CategoriaList = () => {
  const { items: categorias, invalid, loading, error, load, remove } = useCategorias();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState<{ id: number; nombre?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { show } = useStatus();

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
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categorias.map((categoria: Categoria) => (
              <div key={String(categoria.id_categoria ?? Math.random())} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{categoria.nombre}</h3>
              <p className="text-gray-600 mt-2">
                {categoria.descripcion && String(categoria.descripcion).trim()
                  ? categoria.descripcion
                  : <span className="italic text-gray-400">Sin descripción</span>}
              </p>
              <div className="mt-4 flex space-x-2">
                {(() => {
                  const id = Number(categoria.id_categoria);
                  const valid = Number.isFinite(id);
                  return (
                    <button
                      onClick={() => {
                        if (!valid) {
                          console.error('Invalid category id, object:', categoria);
                          show({ title: 'ID inválido', message: 'ID de categoría inválido — revisa la consola para más detalles', variant: 'error' });
                          return;
                        }
                        navigate(`/categorias/${id}/edit`);
                      }}
                      className={`bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ${!valid ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!valid}
                    >
                      Editar
                    </button>
                  );
                })()}
                <button
                  onClick={() => {
                    const id = Number(categoria.id_categoria);
                    if (!Number.isFinite(id)) {
                      console.error('Invalid category id on delete, object:', categoria);
                      show({ title: 'ID inválido', message: 'ID de categoría inválido — no se puede eliminar', variant: 'error' });
                      return;
                    }
                    setPendingDelete({ id, nombre: categoria.nombre });
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
            ))}
          </div>
          {invalid && invalid.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800">Entradas inválidas (sin id_categoria)</h4>
              <pre className="text-xs text-yellow-700 mt-2 overflow-auto max-h-40">{JSON.stringify(invalid, null, 2)}</pre>
            </div>
          )}
          <ConfirmModal
            open={!!pendingDelete}
            title={`Eliminar categoría${pendingDelete?.nombre ? `: ${pendingDelete.nombre}` : ''}`}
            description="Esta acción no se puede deshacer. Se eliminará la categoría y sus relaciones asociadas. ¿Deseas continuar?"
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
                console.error('Delete error', err);
                const message = err instanceof Error ? err.message : String(err);
                const getDetail = (e: unknown): unknown => {
                  if (e && typeof e === 'object') {
                    const rec = e as Record<string, unknown>;
                    if ('payload' in rec) return rec['payload'];
                    if ('response' in rec && rec['response'] && typeof rec['response'] === 'object') {
                      const r = rec['response'] as Record<string, unknown>;
                      if ('data' in r) return r['data'];
                      return r;
                    }
                  }
                  return null;
                };
                const detail = getDetail(err);
                show({ title: 'Error al eliminar', message: `Error al eliminar: ${message}`, detail: detail ?? undefined, variant: 'error' });
              } finally {
                setDeleting(false);
              }
            }}
          />
          {/* StatusModal rendered by global StatusProvider */}
        </>
      )}
    </div>
  );
};

export default CategoriaList;
