import { useState } from 'react';

type Backup = {
  id: string;
  date: string;
  size: string;
  status: 'Completado' | 'En proceso' | 'Fallido';
};

const HISTORY: Backup[] = [
  { id: 'bak-20240901-001', date: '01/09/2024 02:15', size: '1.2 GB', status: 'Completado' },
  { id: 'bak-20240825-001', date: '25/08/2024 02:15', size: '1.2 GB', status: 'Completado' },
  { id: 'bak-20240818-001', date: '18/08/2024 02:15', size: '1.1 GB', status: 'Fallido' },
];

export default function RespaldosPage() {
  const [backups, setBackups] = useState(HISTORY);
  const [isRunning, setIsRunning] = useState(false);

  const triggerBackup = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTimeout(() => {
      setBackups((prev) => [
        {
          id: `bak-${Date.now()}`,
          date: new Date().toLocaleString('es-MX'),
          size: '1.3 GB',
          status: 'Completado',
        },
        ...prev,
      ]);
      setIsRunning(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-950/90 p-4 md:p-6 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <h1 className="text-2xl font-semibold">Respaldos y restauración</h1>
          <p className="mt-2 text-sm text-slate-400">
            Crea copias de seguridad manuales, consulta el historial de respaldos y descarga archivos para restauraciones.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Respaldo manual</h2>
              <p className="text-sm text-slate-400">Lanza una copia inmediata de la base de datos y archivos adjuntos.</p>
            </div>
            <button
              onClick={triggerBackup}
              disabled={isRunning}
              type="button"
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isRunning
                  ? 'cursor-not-allowed bg-slate-700 text-slate-300'
                  : 'bg-purple-500 text-white shadow hover:bg-purple-500/90'
              }`}
            >
              {isRunning ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                  Ejecutando respaldo...
                </>
              ) : (
                <>
                  <span className="text-base">⬇️</span>
                  Ejecutar ahora
                </>
              )}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
              <h3 className="text-sm font-semibold text-slate-200">Programación automática</h3>
              <p className="mt-2 text-xs text-slate-400">Los respaldos se ejecutan cada domingo a las 2:00 AM.</p>
              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <p>• Destino: Almacenamiento S3 (bucket corporativo).</p>
                <p>• Retención: 30 días.</p>
                <p>• Último resultado: 25/08/2024 - correcto.</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
              <h3 className="text-sm font-semibold text-slate-200">Restauraciones</h3>
              <p className="mt-2 text-xs text-slate-400">Contacta al equipo de infraestructura para restauraciones completas.</p>
              <div className="mt-3 space-y-2 text-xs text-slate-400">
                <p>• Tiempo estimado de restauración: 45 minutos.</p>
                <p>• Última restauración: 12/07/2024.</p>
                <p>• Requiere aprobaciones de seguridad antes de ejecutar.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Historial de respaldos</h2>
            <p className="text-sm text-slate-400">Lista de los últimos respaldos realizados (datos demo).</p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-800/80 bg-slate-950/40 text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Código</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Tamaño</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-medium text-slate-100">{backup.id}</td>
                    <td className="px-4 py-3 text-slate-300">{backup.date}</td>
                    <td className="px-4 py-3 text-slate-300">{backup.size}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          backup.status === 'Completado'
                            ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/40'
                            : backup.status === 'En proceso'
                              ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/40'
                              : 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/40'
                        }`}
                      >
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-blue-500/40 hover:text-blue-200" type="button">
                        Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
