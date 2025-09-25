import { useState, useMemo } from 'react';
import type { Categoria } from '../../../../domain/entities';

type Props = {
  initial?: Partial<Categoria>;
  onSubmit: (payload: Partial<Categoria>) => Promise<void> | void;
  submitLabel?: string;
};

// Nota: Asumo un límite de 255 caracteres para descripción (ajusta si tu dominio difiere)
const MAX_DESC = 255;

export default function CategoriaForm({ initial = {}, onSubmit, submitLabel = 'Guardar' }: Props) {
  const [nombre, setNombre] = useState(String(initial.nombre ?? ''));
  const [descripcion, setDescripcion] = useState(String(initial.descripcion ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = useMemo(() => nombre.trim(), [nombre]);
  const trimmedDesc = useMemo(() => descripcion.trim(), [descripcion]);
  const descLength = descripcion.length;
  const nearLimit = descLength > MAX_DESC * 0.85;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      if (!trimmedName) {
        setError('El nombre es obligatorio y no puede estar vacío o contener solo espacios.');
        return;
      }
      await onSubmit({ nombre: trimmedName, descripcion: trimmedDesc ? trimmedDesc.substring(0, MAX_DESC) : null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative max-w-2xl w-full overflow-hidden rounded-xl bg-white/70 backdrop-blur shadow-sm border border-gray-200 p-6 md:p-8 transition-all"
    >
      {/* Decorativo */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 via-white/40 to-white/10" />
      <div className="relative space-y-7">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-gray-800 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-sm font-bold shadow-inner">C</span>
            {initial?.id_categoria ? 'Editar Categoría' : 'Crear Categoría'}
          </h2>
          <p className="text-sm text-gray-500">
            Completa los campos para {initial?.id_categoria ? 'actualizar' : 'registrar'} una categoría.
          </p>
        </header>

        {/* Campo Nombre */}
        <div className="group">
          <label className="block text-xs font-medium uppercase tracking-wide text-gray-600 group-focus-within:text-indigo-600 transition-colors">Nombre</label>
          <div className="relative mt-1">
            <input
              aria-label="Nombre de la categoría"
              placeholder="Ej: Bebidas"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className={`peer w-full rounded-lg border bg-white/80 backdrop-blur px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2 disabled:opacity-60
                ${!trimmedName && nombre ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}
              `}
              maxLength={80}
            />
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-300 peer-focus:text-indigo-400 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            </div>
          </div>
          <div className="mt-1 min-h-[18px]">
            {!trimmedName && nombre && (
              <span className="text-xs text-red-500">El nombre no puede ser solo espacios.</span>
            )}
          </div>
        </div>

        {/* Campo Descripción */}
        <div className="group">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-600 group-focus-within:text-indigo-600 transition-colors">Descripción</label>
            <span className={`text-[10px] font-medium tabular-nums ${nearLimit ? 'text-amber-600' : 'text-gray-400'}`}>{descLength}/{MAX_DESC}</span>
          </div>
          <div className="relative mt-1">
            <textarea
              aria-label="Descripción de la categoría"
              placeholder="Añade detalles opcionales..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, MAX_DESC))}
              className="w-full resize-y rounded-lg border border-gray-300 bg-white/80 backdrop-blur px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 min-h-[120px]"
              rows={4}
            />
            {nearLimit && (
              <div className="absolute bottom-1 right-2 text-[10px] text-amber-600 font-medium">Límite cercano</div>
            )}
          </div>
        </div>

        {/* Mensaje de error */}
        <div aria-live="polite" className="min-h-[20px]">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !trimmedName}
            className="relative inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && (
              <span className="absolute left-3 inline-flex">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </span>
            )}
            <span className={saving ? 'pl-5' : ''}>{saving ? 'Guardando…' : submitLabel}</span>
          </button>
          {!saving && (
            <button
              type="button"
              onClick={() => { setNombre(''); setDescripcion(''); setError(null); }}
              className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition"
            >
              Reiniciar
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

