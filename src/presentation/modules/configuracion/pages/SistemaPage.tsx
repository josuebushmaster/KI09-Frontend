import { useState } from 'react';

const defaultSettings = {
  modoOscuro: true,
  notificaciones: true,
  actualizacionesAutomaticas: false,
  idioma: 'es',
};

export default function SistemaPage() {
  const [settings, setSettings] = useState(defaultSettings);

  const handleToggle = (key: keyof typeof defaultSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950/90 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6 text-slate-100">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <h1 className="text-2xl font-semibold">Configuración del sistema</h1>
          <p className="mt-2 text-sm text-slate-400">
            Ajusta las preferencias generales de la aplicación y los parámetros principales del sistema.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-100">Preferencias generales</h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
              <div>
                <p className="font-medium">Modo oscuro</p>
                <p className="text-sm text-slate-400">Activa un estilo visual oscuro en todo el panel.</p>
              </div>
              <label className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition ${settings.modoOscuro ? 'bg-blue-500/90' : 'bg-slate-600/70'}`}>
                <span className="sr-only">Alternar modo oscuro</span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.modoOscuro}
                  onChange={() => handleToggle('modoOscuro')}
                />
                <span
                  className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition ${settings.modoOscuro ? 'right-1' : 'left-1'}`}
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
              <div>
                <p className="font-medium">Notificaciones</p>
                <p className="text-sm text-slate-400">Recibe alertas cuando haya eventos importantes en el sistema.</p>
              </div>
              <label className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition ${settings.notificaciones ? 'bg-blue-500/90' : 'bg-slate-600/70'}`}>
                <span className="sr-only">Alternar notificaciones</span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.notificaciones}
                  onChange={() => handleToggle('notificaciones')}
                />
                <span
                  className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition ${settings.notificaciones ? 'right-1' : 'left-1'}`}
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
              <div>
                <p className="font-medium">Actualizaciones automáticas</p>
                <p className="text-sm text-slate-400">Instala nuevas versiones automáticamente fuera del horario laboral.</p>
              </div>
              <label className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition ${settings.actualizacionesAutomaticas ? 'bg-blue-500/90' : 'bg-slate-600/70'}`}>
                <span className="sr-only">Alternar actualizaciones automáticas</span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.actualizacionesAutomaticas}
                  onChange={() => handleToggle('actualizacionesAutomaticas')}
                />
                <span
                  className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition ${settings.actualizacionesAutomaticas ? 'right-1' : 'left-1'}`}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-inner shadow-black/20 backdrop-blur">
          <h2 className="text-lg font-semibold">Idiomas disponibles</h2>
          <p className="mt-2 text-sm text-slate-400">Selecciona el idioma principal para la interfaz.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { id: 'es', name: 'Español', description: 'Predeterminado' },
              { id: 'en', name: 'Inglés', description: 'Estados Unidos' },
              { id: 'pt', name: 'Portugués', description: 'Brasil' },
            ].map((lang) => {
              const isActive = settings.idioma === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setSettings((prev) => ({ ...prev, idioma: lang.id }))}
                  className={`rounded-xl border px-4 py-4 text-left transition shadow-sm shadow-black/10 ${
                    isActive
                      ? 'border-blue-500/70 bg-blue-500/10 text-slate-50'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-blue-500/40 hover:bg-blue-500/5'
                  }`}
                >
                  <span className="text-sm font-semibold">{lang.name}</span>
                  <p className="mt-1 text-xs text-slate-400">{lang.description}</p>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
