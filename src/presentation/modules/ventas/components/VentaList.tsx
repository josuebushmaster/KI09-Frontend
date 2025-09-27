import { useEffect, useMemo, useState } from 'react';
import { ConfirmModal } from '../../../core';
import { useStatus } from '../../../core';
import { useVentas } from '../hooks/useVentas';

const VentaList = () => {
  const { items: ventas, loading, error, load, remove } = useVentas();
  const { show } = useStatus();
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ventas;
    return ventas.filter(v =>
      v.id_venta.toString().includes(q) ||
      (v.metodo_pago || '').toLowerCase().includes(q) ||
      (v.fecha_venta || '').toLowerCase().includes(q)
    );
  }, [ventas, search]);

  const totalMonto = useMemo(() => filtered.reduce((acc, v) => acc + (v.total_venta || 0), 0), [filtered]);

  const doDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await remove(pendingDelete);
      setPendingDelete(null);
      show({ title: 'Venta eliminada', message: 'La venta fue eliminada correctamente', variant: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      show({ title: 'Error al eliminar', message: msg, variant: 'error', detail: e });
    } finally {
      setDeleting(false);
    }
  };

  if (loading && ventas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="text-sm text-gray-500">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-emerald-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar ventas</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={load} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4 9a9 9 0 0113.446-3.414M20 15a9 9 0 00-13.446 3.414" /></svg>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <span>Historial de Ventas</span>
          </h2>
          <p className="text-sm text-gray-500">Registra y consulta las ventas confirmadas.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Buscar por id, fecha, método de pago…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white/60 backdrop-blur pl-11 pr-9 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 placeholder:text-gray-400"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </span>
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition" title="Limpiar búsqueda">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Ventas registradas</div>
          <div className="text-2xl font-bold text-gray-900">{ventas.length}</div>
        </div>
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Resultados</div>
          <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
        </div>
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total vendido (filtro)</div>
          <div className="text-2xl font-bold text-gray-900">${totalMonto.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Venta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.map(v => (
                <tr key={v.id_venta} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">#{v.id_venta}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{new Date(v.fecha_venta).toLocaleString('es-ES')}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">${v.total_venta.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{v.metodo_pago}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => setPendingDelete(v.id_venta)} className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 transition" title="Eliminar venta">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500">No hay ventas para mostrar.</div>
        )}
      </div>

      <ConfirmModal
        open={pendingDelete !== null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={doDelete}
        loading={deleting}
        title="Eliminar venta"
        description={`¿Seguro que deseas eliminar la venta #${pendingDelete ?? ''}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default VentaList;
