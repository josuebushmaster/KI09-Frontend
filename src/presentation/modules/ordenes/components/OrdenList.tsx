import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrdenes } from '../hooks/useOrdenes';
import { useClientes } from '../../clientes';
import { ConfirmModal, useStatus } from '../../../core/';

const OrdenList = () => {
  const { items: ordenes, loading, error, load, remove } = useOrdenes();
  const { items: clientes, load: loadClientes } = useClientes();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [pendingDelete, setPendingDelete] = useState<{ id: number; numero?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    const saved = localStorage.getItem('ordenes-view-mode');
    return saved === 'list' ? 'list' : 'cards';
  });
  const { show } = useStatus();

  // Guardar preferencia de vista
  const handleViewModeChange = (mode: 'cards' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('ordenes-view-mode', mode);
  };

  useEffect(() => {
    load();
    loadClientes();
  }, [load, loadClientes]);

  // Escuchar evento global para forzar recarga desde otros componentes (ej. formulario)
  useEffect(() => {
    const handler = () => {
      try {
        load();
      } catch (e) {
        console.warn('Error recargando ordenes desde evento global', e);
      }
    };
    window.addEventListener('ordenes:reload', handler as EventListener);
    return () => window.removeEventListener('ordenes:reload', handler as EventListener);
  }, [load]);

  // Función para obtener nombre de cliente por ID
  const getClienteName = (id_cliente?: number): string => {
    if (!id_cliente) return 'Cliente desconocido';
    
    const cliente = clientes.find(c => c.id_cliente === id_cliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido || ''}`.trim() : `Cliente ${id_cliente}`;
  };

  // Función para formatear estado
  const getEstadoColor = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('pendiente') || estadoLower.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (estadoLower.includes('completado') || estadoLower.includes('entregado') || estadoLower.includes('completed')) {
      return 'bg-green-100 text-green-800';
    }
    if (estadoLower.includes('cancelado') || estadoLower.includes('cancelled')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // Función para formatear estado de envío
  const getEstadoEnvioColor = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('enviado') || estadoLower.includes('shipped')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (estadoLower.includes('entregado') || estadoLower.includes('delivered')) {
      return 'bg-green-100 text-green-800';
    }
    if (estadoLower.includes('preparando') || estadoLower.includes('preparing')) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // Filtrar órdenes basado en el término de búsqueda y rango de fechas
  const filteredOrdenes = ordenes.filter((orden) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = q === '' || 
      orden.id_orden.toString().includes(q) ||
      getClienteName(orden.id_cliente).toLowerCase().includes(q) ||
      orden.estado_orden?.toLowerCase().includes(q) ||
      orden.direccion_envio?.toLowerCase().includes(q) ||
      orden.ciudad_envio?.toLowerCase().includes(q);

    // Fecha
    let dateOk = true;
    if (dateFrom || dateTo) {
      const d = new Date(orden.fecha_orden);
      if (Number.isNaN(d.getTime())) dateOk = false;
      else {
        if (dateFrom) {
          const from = new Date(dateFrom);
          if (!Number.isNaN(from.getTime()) && d < from) dateOk = false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          if (!Number.isNaN(to.getTime())) {
            const toEnd = new Date(to);
            toEnd.setHours(23, 59, 59, 999);
            if (d > toEnd) dateOk = false;
          }
        }
      }
    }

    return matchesSearch && dateOk;
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
      show({ title: 'Orden eliminada', message: 'La orden se eliminó correctamente.', variant: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      show({ title: 'Error al eliminar', message: `Error al eliminar: ${message}`, detail: err, variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading && ordenes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-sm text-gray-500">Cargando órdenes...</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar órdenes</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
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
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white shadow">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.5a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25h6.5m12.75 0a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25V0H6.75a2.25 2.25 0 00-2.25 2.25v16.5" />
              </svg>
            </span>
            <span>Gestión de Órdenes</span>
          </h2>
          <p className="text-sm text-gray-500">Administra las órdenes y pedidos del sistema de ventas.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[280px]">
            <input
              id="ordenes-search"
              type="text"
              placeholder="Buscar por número, cliente, estado, dirección…"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                title="Limpiar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          
          {/* Controles de vista */}
          <div className="hidden md:flex items-center gap-2">
            <input
              type="date"
              aria-label="Fecha desde"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none"
            />
            <input
              type="date"
              aria-label="Fecha hasta"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none"
            />
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-xs text-red-600 hover:text-red-700"
                title="Limpiar fechas"
              >
                Limpiar fechas
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('cards')}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition ${
                viewMode === 'cards' 
                  ? 'bg-white shadow-sm text-red-600' 
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
                  ? 'bg-white shadow-sm text-red-600' 
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
            to="/ordenes/create"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md shadow-red-600/25 transition group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva
          </Link>
        </div>
      </div>

      {/* Filtros activos */}
      {searchTerm && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Filtros activos:</span>
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md">
            Búsqueda: "{searchTerm}"
            <button onClick={() => setSearchTerm('')} className="hover:text-red-900" title="Limpiar filtro">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
          <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700 font-medium">
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total órdenes</p>
              <p className="text-2xl font-bold text-gray-900">{ordenes.length}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.5a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25h6.5m12.75 0a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25V0H6.75a2.25 2.25 0 00-2.25 2.25v16.5" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Filtradas</p>
              <p className="text-2xl font-bold text-gray-900">{filteredOrdenes.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total ventas</p>
              <p className="text-2xl font-bold text-gray-900">
                ${ordenes.reduce((sum, orden) => sum + (orden.total_orden || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vista actual</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{viewMode === 'cards' ? 'Tarjetas' : 'Lista'}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {viewMode === 'cards' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {filteredOrdenes.length === 0 ? (
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          {ordenes.length === 0 ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay órdenes disponibles</h3>
              <p className="text-gray-500 mb-4">Comienza registrando tu primera orden en el sistema.</p>
              <Link
                to="/ordenes/create"
                className="inline-flex items-center gap-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Crear primera orden
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron órdenes</h3>
              <p className="text-gray-500 mb-4">No hay órdenes que coincidan con los filtros aplicados.</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4 9a9 9 0 0113.446-3.414M20 15a9 9 0 00-13.446 3.414" />
                </svg>
                Limpiar filtros
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            // Vista de tarjetas
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrdenes.map((orden) => (
                <div key={orden.id_orden} className="group relative bg-white/60 backdrop-blur rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.5a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25h6.5m12.75 0a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25V0H6.75a2.25 2.25 0 00-2.25 2.25v16.5" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/ordenes/${orden.id_orden}/edit`}
                          className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                          title="Editar orden"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setPendingDelete({ id: Number(orden.id_orden), numero: `#${orden.id_orden}` })}
                          className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                          title="Eliminar orden"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                          Orden #{orden.id_orden}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{getClienteName(orden.id_cliente)}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-red-600">${orden.total_orden?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Fecha:</span>
                          <span className="text-gray-900">
                            {new Date(orden.fecha_orden).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ciudad:</span>
                          <span className="text-gray-900">{orden.ciudad_envio}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(orden.estado_orden)}`}>
                            {orden.estado_orden}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoEnvioColor(orden.estado_envio)}`}>
                            {orden.estado_envio}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vista de lista (tabla)
            <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/60">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 min-w-[120px]">
                        Orden
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 min-w-[180px]">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 min-w-[200px]">
                        Envío
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 min-w-[100px]">
                        Total
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 min-w-[120px]">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/30 divide-y divide-gray-200">
                    {filteredOrdenes.map((orden) => (
                      <tr key={orden.id_orden} className="hover:bg-red-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center min-w-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.5a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25h6.5m12.75 0a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25V0H6.75a2.25 2.25 0 00-2.25 2.25v16.5" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                #{orden.id_orden}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(orden.fecha_orden).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="min-w-0">
                            <div className="text-sm text-gray-900 truncate">
                              {getClienteName(orden.id_cliente)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {orden.metodo_envio}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="min-w-0">
                            <div className="text-sm text-gray-900 truncate">
                              {orden.direccion_envio}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {orden.ciudad_envio}, {orden.codigo_postal_envio}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="text-sm font-bold text-red-600">
                            ${orden.total_orden?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-gray-500">
                            + ${orden.costo_envio?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(orden.estado_orden)}`}>
                              {orden.estado_orden}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoEnvioColor(orden.estado_envio)}`}>
                              {orden.estado_envio}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              to={`/ordenes/${orden.id_orden}/edit`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                              title="Editar orden"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => setPendingDelete({ id: Number(orden.id_orden), numero: `#${orden.id_orden}` })}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                              title="Eliminar orden"
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
        </>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={`Eliminar orden${pendingDelete?.numero ? ` ${pendingDelete.numero}` : ''}`}
        description="Esta acción no se puede deshacer. ¿Deseas continuar?"
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default OrdenList;