import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCategorias } from '../hooks/useCategorias';
import type { Categoria } from '../../../../domain/entities';
import { ConfirmModal, useStatus } from '../../../core/';

const CategoriaList = () => {
  const { items: categorias, invalid, loading, error, load, remove } = useCategorias();
  const navigate = useNavigate();
  // confirmación mediante modal reutilizable
  const [pendingDelete, setPendingDelete] = useState<{ mode: 'single' | 'bulk'; ids: number[]; nombre?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  // menú compacto en móvil
  const [openRowMenu, setOpenRowMenu] = useState<number | null>(null);
  // selección masiva
  const [selected, setSelected] = useState<Set<number>>(new Set());
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

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allVisibleIds = filteredCategorias
    .map(c => Number(c.id_categoria))
    .filter(id => Number.isFinite(id));

  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selected.has(id));

  const toggleSelectAll = () => {
    // No necesitamos el estado previo si vamos a seleccionar/deseleccionar todo directamente
    setSelected(() => {
      if (allSelected) return new Set();
      return new Set(allVisibleIds);
    });
  };

  const executeDeletion = async (ids: number[], mode: 'single' | 'bulk') => {
    setDeleting(true);
    try {
      for (const id of ids) {
        await remove(id);
      }
      if (mode === 'bulk') {
        setSelected(new Set());
        show({ title: 'Eliminación masiva', message: `Se eliminaron ${ids.length} categorías.`, variant: 'success' });
      } else {
        show({ title: 'Categoría eliminada', message: 'La categoría se eliminó correctamente.', variant: 'success' });
      }
    } catch (err) {
      console.error('Delete error', err);
      const message = err instanceof Error ? err.message : String(err);
      show({ title: mode === 'bulk' ? 'Error en eliminación masiva' : 'Error al eliminar', message, detail: err, variant: 'error' });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="relative rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur shadow-sm p-8 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.9),transparent_60%)]" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Gestión de Categorías</h2>
              <p className="text-sm text-gray-500">Cargando datos…</p>
            </div>
            <div className="h-10 w-40 rounded-xl bg-gray-200/60 animate-pulse" />
          </div>
          <div className="space-y-4 relative z-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100 last:border-none">
                <div className="h-4 w-6 bg-gray-200/70 rounded animate-pulse col-span-1" />
                <div className="h-4 w-40 bg-gray-200/70 rounded animate-pulse col-span-3" />
                <div className="h-4 w-full bg-gray-200/70 rounded animate-pulse col-span-5 hidden md:block" />
                <div className="flex justify-end gap-2 col-span-3">
                  <div className="h-8 w-16 bg-gray-200/70 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-200/70 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-6 lg:px-8 lg:pb-8 space-y-8 relative">
      {selected.size > 0 && (
        <div className="sticky top-2 z-30 mb-2 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50 to-red-100/60 backdrop-blur px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center text-xs font-bold shadow">{selected.size}</div>
              <div className="text-sm font-medium text-red-900">Seleccionadas</div>
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              <button
                disabled={deleting}
                onClick={() => {
                  if (selected.size === 0) return;
                  setPendingDelete({ mode: 'bulk', ids: Array.from(selected) });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-50"
              >
                {deleting ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12m-9 4v6m6-6v6M9 7l1-3h4l1 3m-9 0h12l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7z" /></svg>
                )}
                Eliminar seleccionadas
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4 9a9 9 0 0113.446-3.414M20 15a9 9 0 00-13.446 3.414" /></svg>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header / Toolbar */}
      <div className="relative rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur shadow-sm px-6 py-6 lg:py-7 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.9),transparent_60%)]" />
        <div className="relative flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white shadow">📂</span>
              <span>Gestión de Categorías</span>
            </h2>
            <p className="text-sm text-gray-500">Administra, busca y depura las categorías del catálogo.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 min-w-[240px]">
              <input
                id="search"
                type="text"
                placeholder="Buscar nombre o descripción…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white/60 backdrop-blur pl-11 pr-9 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-red-500/30 focus:border-red-600 placeholder:text-gray-400"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              </span>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Limpiar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              {searchTerm && (
                <button
                  onClick={clearFilters}
                  className="group inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white/60 px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 hover:text-gray-700 transition"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Limpiar
                </button>
              )}
              <Link
                to="/categorias/create"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-br from-red-600 to-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-700/25 hover:from-red-600 hover:to-red-800 transition focus:outline-none focus:ring-2 focus:ring-red-500/40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Nueva
              </Link>
            </div>
          </div>
        </div>
        {(searchTerm || filteredCategorias.length !== categorias.length) && (
          <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-gray-500">
            <span>{filteredCategorias.length} de {categorias.length} categorías</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-600/10">{searchTerm}</span>
            )}
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
          <div className="relative rounded-2xl border border-gray-200/70 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300/60 hover:scrollbar-thumb-gray-400/70">
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50/80 backdrop-blur">
                  <tr className="text-[11px] uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3 text-center font-semibold w-10">
                      <input
                        id="select-all"
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        aria-label="Seleccionar todas"
                      />
                    </th>
                    <th className="px-4 py-3 text-center font-semibold w-10">#</th>
                    <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left font-semibold">Descripción</th>
                    <th className="px-4 py-3 text-right font-semibold w-40">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategorias.map((categoria: Categoria, index: number) => {
                    const id = Number(categoria.id_categoria);
                    const valid = Number.isFinite(id);
                    const hasDesc = categoria.descripcion && String(categoria.descripcion).trim();
                    return (
                      <tr key={String(categoria.id_categoria ?? Math.random())} className="group hover:bg-red-50/40 transition-colors">
                        <td className="px-4 py-3 text-center align-middle">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                            checked={selected.has(id)}
                            onChange={() => toggleSelect(id)}
                            aria-label={`Seleccionar ${categoria.nombre}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-center align-middle">
                          <span className="text-xs font-semibold text-gray-500">{index + 1}</span>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition" />
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{categoria.nombre}</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 align-middle">
                          {hasDesc ? (
                            <p className="text-sm text-gray-600 line-clamp-2 max-w-prose">{categoria.descripcion}</p>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">Sin descripción</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right align-middle">
                          <div className="flex justify-end gap-1.5">
                            <div className="hidden sm:flex items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-xl px-1.5 py-1 border border-gray-200 shadow-sm">
                              <button
                                aria-label="Editar"
                                onClick={() => {
                                  if (!valid) {
                                    show({ title: 'ID inválido', message: 'ID inválido', variant: 'error' });
                                    return;
                                  }
                                  navigate(`/categorias/${id}/edit`);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-gray-50/60 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L8.478 18.174a4.5 4.5 0 01-1.897 1.128L4.125 20.25l.948-2.456a4.5 4.5 0 011.128-1.897L16.862 4.487z" /></svg>
                                <span className="hidden md:inline">Editar</span>
                              </button>
                              <button
                                aria-label="Eliminar"
                                onClick={() => setPendingDelete({ mode: 'single', ids: [id], nombre: categoria.nombre })}
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-red-600 bg-red-50/70 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7l1-3h4l1 3m1 0h-8l1 12a2 2 0 002 2h2a2 2 0 002-2l1-12zm-6 0h12" /></svg>
                                <span className="hidden md:inline">Eliminar</span>
                              </button>
                            </div>
                            <div className="relative sm:hidden">
                              <button
                                onClick={() => setOpenRowMenu(openRowMenu === id ? null : id)}
                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white/70 text-gray-500 hover:bg-gray-100"
                                aria-label="Acciones"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                              </button>
                              {openRowMenu === id && (
                                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-lg z-10 p-1 text-sm">
                                  <button
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                                    onClick={() => { setOpenRowMenu(null); navigate(`/categorias/${id}/edit`); }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L8.478 18.174a4.5 4.5 0 01-1.897 1.128L4.125 20.25l.948-2.456a4.5 4.5 0 011.128-1.897L16.862 4.487z" /></svg>
                                    Editar
                                  </button>
                                  <button
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    onClick={() => { setOpenRowMenu(null); setPendingDelete({ mode: 'single', ids: [id], nombre: categoria.nombre }); }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7l1-3h4l1 3m1 0h-8l1 12a2 2 0 002 2h2a2 2 0 002-2l1-12zm-6 0h12" /></svg>
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
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
          {/* StatusModal rendered by global StatusProvider */}
        </>
      )}
      <ConfirmModal
        open={!!pendingDelete}
        title={pendingDelete?.mode === 'bulk'
          ? `Eliminar ${pendingDelete.ids.length} categorías`
          : `Eliminar categoría${pendingDelete?.nombre ? `: ${pendingDelete.nombre}` : ''}`}
        description={pendingDelete?.mode === 'bulk'
          ? 'Esta acción eliminará permanentemente todas las categorías seleccionadas. No se puede deshacer.'
          : 'Esta acción no se puede deshacer. ¿Deseas continuar?'}
        confirmLabel={pendingDelete?.mode === 'bulk' ? 'Sí, eliminar todas' : 'Sí, eliminar'}
        cancelLabel="Cancelar"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
            executeDeletion(pendingDelete.ids, pendingDelete.mode);
        }}
      />
    </div>
  );
};

export default CategoriaList;
