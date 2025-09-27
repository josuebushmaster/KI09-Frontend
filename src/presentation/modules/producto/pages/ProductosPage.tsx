import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductos } from '../hooks/useProductos';
import { ConfirmModal, useStatus } from '../../../core';

const ProductosPage = () => {
  const { items: productos, loading, error, load, remove } = useProductos();
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: number; nombre?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    const saved = localStorage.getItem('productos-view-mode');
    return saved === 'list' ? 'list' : 'cards';
  });
  const { show } = useStatus();

  // Guardar preferencia de vista
  const handleViewModeChange = (mode: 'cards' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('productos-view-mode', mode);
  };

  useEffect(() => {
    load();
  }, [load]);

  // Filtrar productos basado en el término de búsqueda
  const filteredProductos = productos.filter((producto) => {
    const matchesSearch = searchTerm === '' || 
      producto.nombre_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const clearFilters = () => {
    setSearchTerm('');
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await remove(pendingDelete.id);
      setPendingDelete(null);
      show({ title: 'Producto eliminado', message: 'El producto se eliminó correctamente.', variant: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      show({ title: 'Error al eliminar', message: `Error al eliminar: ${message}`, detail: err, variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading && productos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="text-sm text-gray-500">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar productos</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4 9a9 9 0 0113.446-3.414M20 15a9 9 0 00-13.446 3.414" />
          </svg>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con título y controles */}
      <div className="relative flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow">📦</span>
            <span>Gestión de Productos</span>
          </h2>
          <p className="text-sm text-gray-500">Administra el inventario de productos y su información.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              id="search"
              type="text"
              placeholder="Buscar nombre o descripción…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white/60 backdrop-blur pl-11 pr-9 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-orange-500/30 focus:border-orange-600 placeholder:text-gray-400"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </span>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                title="Limpiar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          
          {/* Controles de vista */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('cards')}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition ${
                viewMode === 'cards' 
                  ? 'bg-white shadow-sm text-orange-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Vista de tarjetas"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-orange-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Vista de lista"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Botón crear */}
          <Link
            to="/productos/create"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md shadow-orange-600/25 transition group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo
          </Link>
        </div>
      </div>

      {/* Filtros activos */}
      {searchTerm && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Filtros activos:</span>
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-md">
            Búsqueda: "{searchTerm}"
            <button onClick={() => setSearchTerm('')} className="hover:text-orange-900" title="Limpiar filtro">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
          <button onClick={clearFilters} className="text-xs text-orange-600 hover:text-orange-700 font-medium">
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total productos</p>
              <p className="text-2xl font-bold text-gray-900">{productos.length}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Con stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {productos.filter(p => p.stock && p.stock > 0).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mostrando</p>
              <p className="text-2xl font-bold text-gray-900">{filteredProductos.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {viewMode === 'cards' ? (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      {filteredProductos.length === 0 ? (
        <div className="text-center py-12 bg-white/30 backdrop-blur rounded-xl border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron productos' : 'No hay productos'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza creando tu primer producto'
            }
          </p>
          {!searchTerm && (
            <Link
              to="/productos/create"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Crear producto
            </Link>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* Vista de Cards */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProductos.map((producto) => (
            <div key={producto.id_producto} className="group bg-white/60 backdrop-blur rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              {/* Imagen */}
              {producto.imagen_url && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img 
                    src={producto.imagen_url} 
                    alt={producto.nombre_producto} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-orange-700 transition">
                      {producto.nombre_producto}
                    </h3>
                    {producto.id_categoria && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Cat. {producto.id_categoria}
                      </span>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                {producto.descripcion && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {producto.descripcion}
                  </p>
                )}

                {/* Precios y stock */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Precio:</span>
                    <span className="text-lg font-bold text-orange-600">
                      ${producto.precio?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  {producto.costo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Costo:</span>
                      <span className="text-sm text-gray-700">
                        ${producto.costo.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {producto.stock !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Stock:</span>
                      <span className={`text-sm font-medium ${
                        producto.stock > 10 ? 'text-green-600' : 
                        producto.stock > 0 ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {producto.stock} unidades
                      </span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link
                    to={`/productos/${producto.id_producto}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 hover:text-orange-800 px-3 py-2 rounded-lg text-sm font-medium transition group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                    Editar
                  </Link>
                  <button
                    onClick={() => setPendingDelete({ 
                      id: Number(producto.id_producto), 
                      nombre: producto.nombre_producto 
                    })}
                    className="inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 px-3 py-2 rounded-lg text-sm font-medium transition group"
                    title="Eliminar producto"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista de Lista */
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProductos.map((producto) => (
                  <tr key={producto.id_producto} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {producto.imagen_url && (
                          <div className="flex-shrink-0 h-12 w-12 mr-4">
                            <img 
                              className="h-12 w-12 rounded-lg object-cover" 
                              src={producto.imagen_url} 
                              alt={producto.nombre_producto}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {producto.nombre_producto}
                          </div>
                          {producto.descripcion && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {producto.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-orange-600">
                        ${producto.precio?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {producto.costo ? `$${producto.costo.toFixed(2)}` : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {producto.stock !== undefined ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          producto.stock > 10 ? 'bg-green-100 text-green-800' : 
                          producto.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {producto.stock} unidades
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {producto.id_categoria ? (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Cat. {producto.id_categoria}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/productos/${producto.id_producto}/edit`}
                          className="text-orange-600 hover:text-orange-900 transition-colors"
                          title="Editar producto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setPendingDelete({ 
                            id: Number(producto.id_producto), 
                            nombre: producto.nombre_producto 
                          })}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Eliminar producto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        open={!!pendingDelete}
        title={`Eliminar producto${pendingDelete?.nombre ? `: ${pendingDelete.nombre}` : ''}`}
        description="Esta acción no se puede deshacer. ¿Deseas continuar?"
        confirmLabel="Sí, eliminar"
        cancelLabel="No, cancelar"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ProductosPage;
