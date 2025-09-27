import { useState, useEffect } from 'react';

type Report = {
  id: string;
  title: string;
  embedUrl: string; // full embed URL (must be published / shared for embedding)
};

const SAMPLE_REPORTS: Report[] = [
  {
    id: 'r1',
    title: 'Resumen de ventas (ejemplo)',
    embedUrl: 'https://lookerstudio.google.com/embed/reporting/7ba3fc6d-c72a-4af5-9cbe-fc70dbb83a1b/page/wvwYF',
  },
];

function ReportEmbed({ url, title }: { url: string; title: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-2 shadow-sm">
      <div className="relative w-full pb-[56.25%]">
        <iframe
          title={title}
          src={url}
          loading="lazy"
          className="absolute left-0 top-0 h-full w-full rounded-lg"
          frameBorder={0}
          allowFullScreen
        />
      </div>
    </div>
  );
}

function toReportingUrl(embedUrl: string) {
  try {
    if (!embedUrl) return embedUrl;
    // convert embed/reporting -> reporting
    if (embedUrl.includes('/embed/reporting/')) return embedUrl.replace('/embed/reporting/', '/reporting/');
    // if already reporting, return as-is
    if (embedUrl.includes('/reporting/')) return embedUrl;
    return embedUrl;
  } catch {
    return embedUrl;
  }
}

export default function AnalyticsPage() {
  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const raw = window.localStorage.getItem('analytics_reports_v1');
      if (raw) return JSON.parse(raw) as Report[];
    } catch (err) {
      console.warn('analytics: no se pudo leer reports desde localStorage', err);
    }
    return SAMPLE_REPORTS;
  });

  const [activeId, setActiveId] = useState<string>(reports[0]?.id ?? '');
  const [inputUrl, setInputUrl] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem('analytics_reports_v1', JSON.stringify(reports));
    } catch (err) {
      console.warn('analytics: no se pudo persistir reports', err);
    }
  }, [reports]);

  const active = reports.find((r) => r.id === activeId) ?? reports[0];

  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-white/80 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">Analíticas</h1>
          <p className="mt-1 text-sm text-neutral-500">Reportes embebidos de Looker Studio dentro de la aplicación.</p>
        </header>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          <aside className="w-full md:w-64">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-800">Reportes</h3>
              <p className="mt-2 text-xs text-neutral-500">Pega la URL de Looker Studio para añadirla como reporte embebido.</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://lookerstudio.google.com/reporting/..."
                  className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => {
                    const raw = inputUrl.trim();
                    setInputError(null);
                    if (!raw) {
                      setInputError('Introduce una URL');
                      return;
                    }
                    if (!/lookerstudio\.google\.com/i.test(raw)) {
                      setInputError('La URL no parece ser de Looker Studio');
                      return;
                    }
                    // Try to extract report id and optional page id
                    // Matches: /reporting/<reportId>/page/<pageId>
                    const m = raw.match(/reporting\/([^/?#]+)(?:\/page\/([^/?#]+))?/i);
                    let embed = '';
                    if (m) {
                      const reportId = m[1];
                      const pageId = m[2];
                      embed = `https://lookerstudio.google.com/embed/reporting/${reportId}` + (pageId ? `/page/${pageId}` : '');
                    } else {
                      // fallback: if already an embed URL or other format, try converting /reporting/ -> /embed/reporting/
                      if (raw.includes('/reporting/')) embed = raw.replace('/reporting/', '/embed/reporting/');
                      else if (raw.includes('/embed/reporting/')) embed = raw;
                      else {
                        setInputError('No pude extraer el ID del reporte desde la URL');
                        return;
                      }
                    }

                    const id = `r_${Date.now()}`;
                    // Derive title from URL: try last path segment or fallback name
                    let title = '';
                    try {
                      const u = new URL(raw);
                      const parts = u.pathname.split('/').filter(Boolean);
                      title = parts.slice(-1)[0] ?? `Reporte ${reports.length + 1}`;
                    } catch {
                      title = `Reporte ${reports.length + 1}`;
                    }

                    const nr = { id, title, embedUrl: embed } as Report;
                    setReports((s) => [nr, ...s]);
                    setActiveId(id);
                    setInputUrl('');
                  }}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Añadir
                </button>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {inputError && <div className="text-xs text-red-600">{inputError}</div>}
                {reports.map((r) => (
                  <div key={r.id} className={`flex items-center gap-2 rounded-lg px-2 py-1 transition ${r.id === activeId ? 'bg-red-50' : 'hover:bg-neutral-100'}`}>
                    <div className="flex-1">
                      <button onClick={() => setActiveId(r.id)} className={`w-full text-left text-sm ${r.id === activeId ? 'font-semibold text-red-700' : 'text-neutral-700'}`}>
                        {r.title}
                      </button>
                      {editingId === r.id && (
                        <div className="mt-2">
                          <input aria-label={`Editar título de ${r.title}`} placeholder="Nuevo título" value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="w-full rounded-md border px-2 py-1 text-sm" />
                        </div>
                      )}
                    </div>

                    {editingId === r.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const val = editingValue.trim() || r.title;
                            setReports((s) => s.map((x) => (x.id === r.id ? { ...x, title: val } : x)));
                            setEditingId(null);
                          }}
                          className="rounded-md bg-green-600 px-2 py-1 text-xs text-white"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingValue('');
                          }}
                          className="rounded-md bg-neutral-100 px-2 py-1 text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : pendingDeleteId === r.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setReports((s) => s.filter((x) => x.id !== r.id));
                            setPendingDeleteId(null);
                            if (activeId === r.id) {
                              const next = reports.find((x) => x.id !== r.id);
                              setActiveId(next ? next.id : '');
                            }
                          }}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs text-white"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={() => setPendingDeleteId(null)}
                          className="rounded-md bg-neutral-100 px-2 py-1 text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingId(r.id);
                            setEditingValue(r.title);
                          }}
                          className="rounded-md bg-neutral-100 px-2 py-1 text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setPendingDeleteId(r.id)}
                          className="rounded-md bg-neutral-100 px-2 py-1 text-xs"
                        >
                          Borrar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-neutral-900">{active?.title}</h2>
              <div className="mt-4">
                {active ? (
                  <>
                    <ReportEmbed url={active.embedUrl} title={active.title} />
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <a
                        className="rounded-md bg-neutral-100 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-200"
                        href={toReportingUrl(active.embedUrl)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver en Looker Studio
                      </a>
                      <div className="text-xs text-neutral-500">
                        Si aparece un mensaje como "No se puede acceder al informe" o "El propietario ha inhabilitado la visualización en otros sitios web", pide al propietario que habilite la opción de incrustar/publicar del informe o abre el informe en Looker Studio y verifica los permisos.
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-neutral-300/70 bg-white/70 p-6 text-center text-neutral-500">No hay reportes disponibles</div>
                )}
              </div>
              <div className="mt-3 text-xs text-neutral-500">Nota: reemplaza las URLs de ejemplo por las URLs de embed públicas de tus reportes en Looker Studio.</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
