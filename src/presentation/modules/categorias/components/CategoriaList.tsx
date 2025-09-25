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
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');

  // load on mount
  useEffect(() => {
    load();
  }, [load]);

  // Filtrar categorías basado en los criterios
  const filteredCategorias = categorias.filter((categoria: Categoria) => {
    // Filtro por término de búsqueda (nombre o descripción)
    const matchesSearch = searchTerm === '' || 
      categoria.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoria.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const clearFilters = () => {
    setSearchTerm('');
  };

  if (loading) {
    return <div className="p-4">Cargando categorías...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Gestión de Categorías</h2>
        <Link to="/categorias/create" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium shadow">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Crear categoría
        </Link>
      </div>
      
      {/* Filtros */}
      <div className="mb-4 bg-gray-50 rounded-lg shadow-inner border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1">
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="🔍 Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-4 pr-8 py-2 text-sm rounded-md border-gray-200 shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all duration-200 bg-gray-50/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  title="Limpiar búsqueda"
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {searchTerm && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all duration-150"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpiar
              </button>
            )}
          </div>
        </div>
        
        {/* Contador compacto */}
        {(searchTerm || filteredCategorias.length !== categorias.length) && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {filteredCategorias.length} de {categorias.length} categorías
              </span>
              {searchTerm && (
                <div className="flex items-center gap-1">
                  {searchTerm && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                      "{searchTerm}"
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {filteredCategorias.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          {categorias.length === 0 ? (
            <p className="text-gray-500">No hay categorías disponibles.</p>
          ) : (
            <div>
              <p className="text-gray-500 mb-2">No se encontraron categorías con los filtros aplicados.</p>
              <button
                onClick={clearFilters}
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                Limpiar filtros para ver todas las categorías
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-auto sm:table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      N°
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="hidden sm:table-cell px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategorias.map((categoria: Categoria, index: number) => {
                    const id = Number(categoria.id_categoria);
                    const valid = Number.isFinite(id);
                    return (
                      <tr key={String(categoria.id_categoria ?? Math.random())} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">
                          <div className="text-sm font-medium text-gray-500">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {categoria.nombre}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3">
                          <div className="text-sm text-gray-600">
                            {categoria.descripcion && String(categoria.descripcion).trim()
                              ? categoria.descripcion
                              : <span className="italic text-gray-400">Sin descripción</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                if (!valid) {
                                  console.error('Invalid category id, object:', categoria);
                                  show({ title: 'ID inválido', message: 'ID de categoría inválido — revisa la consola para más detalles', variant: 'error' });
                                  return;
                                }
                                navigate(`/categorias/${id}/edit`);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17h2m-1-1V5" />
                              </svg>
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                if (!Number.isFinite(id)) {
                                  console.error('Invalid category id on delete, object:', categoria);
                                  show({ title: 'ID inválido', message: 'ID de categoría inválido — no se puede eliminar', variant: 'error' });
                                  return;
                                }
                                setPendingDelete({ id, nombre: categoria.nombre });
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
