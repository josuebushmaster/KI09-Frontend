import { useState, useMemo } from 'react';
import { inputClass, labelFloatClass, textareaClass, actionButtonPrimary, secondaryButton, subtleBadge } from '../../shared/formStyles';
import type { Categoria } from '../../../../domain/entities';

type Props = {
  initial?: Partial<Categoria>;
  onSubmit: (payload: Partial<Categoria>) => Promise<void> | void;
  submitLabel?: string;
  readonly?: boolean;
  showSuccessInline?: boolean;
};

// Nota: Asumo un límite de 255 caracteres para descripción (ajusta si tu dominio difiere)
const MAX_DESC = 255;

export default function CategoriaForm({ initial = {}, onSubmit, submitLabel = 'Guardar', readonly = false, showSuccessInline = false }: Props) {
  const [nombre, setNombre] = useState(String(initial.nombre ?? ''));
  const [descripcion, setDescripcion] = useState(String(initial.descripcion ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const trimmedName = useMemo(() => nombre.trim(), [nombre]);
  const trimmedDesc = useMemo(() => descripcion.trim(), [descripcion]);
  const descLength = descripcion.length;
  const nearLimit = descLength > MAX_DESC * 0.85;
  const percent = Math.min(100, Math.round((descLength / MAX_DESC) * 100));

  const invalidName = touched && !trimmedName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || readonly) return;
    setError(null);
    setSuccess(null);
    setTouched(true);
    if (!trimmedName) return;
    setSaving(true);
    try {
      await onSubmit({ nombre: trimmedName, descripcion: trimmedDesc ? trimmedDesc.substring(0, MAX_DESC) : null });
      if (showSuccessInline) {
        setSuccess(initial?.id_categoria ? 'Cambios guardados correctamente.' : 'Categoría creada con éxito.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setNombre('');
    setDescripcion('');
    setError(null);
    setTouched(false);
  };

  return (
    <div className="relative max-w-lg mx-auto">
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-red-700/40 via-red-800/30 to-red-900/50 blur-sm opacity-60" aria-hidden="true" />
      <form
        onSubmit={handleSubmit}
        className="relative rounded-xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-lg px-6 py-6 space-y-6 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),rgba(255,255,255,0))]" aria-hidden />

  <header className="space-y-1.5 relative z-10">
          <div className={subtleBadge}>
            {initial?.id_categoria ? 'Edición' : 'Nueva'} categoría
          </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              {initial?.id_categoria ? 'Editar Categoría' : 'Crear Categoría'}
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white text-sm shadow-md">
                {initial?.id_categoria ? '✏️' : '＋'}
              </span>
            </h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-prose">
            {initial?.id_categoria
              ? 'Actualiza los datos y guarda los cambios. Todos los campos son validados en tiempo real.'
              : 'Completa la información para registrar una nueva categoría del catálogo.'}
          </p>
        </header>

        {/* Campo Nombre con label flotante */}
        <div className="relative">
          <input
            id="categoria-nombre"
            aria-describedby="nombre-help"
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onBlur={() => setTouched(true)}
            maxLength={80}
            className={inputClass(invalidName)}
            autoComplete="off"
            disabled={readonly}
          />
          <label
            htmlFor="categoria-nombre"
            className={labelFloatClass(invalidName)}
          >Nombre</label>
          <div id="nombre-help" className="mt-1 min-h-[18px] text-xs">
            {invalidName ? (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" /></svg>
                El nombre es obligatorio.
              </span>
            ) : (
              <span className="text-gray-400">Máx. 80 caracteres.</span>
            )}
          </div>
        </div>

        {/* Descripción con contador y barra de progreso */}
  <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="categoria-descripcion" className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">Descripción (opcional)</label>
            <span className={`text-[11px] font-semibold tabular-nums ${nearLimit ? 'text-amber-600' : 'text-gray-400'}`}>{descLength}/{MAX_DESC}</span>
          </div>
          <div className="relative group">
            <textarea
              id="categoria-descripcion"
              placeholder="Añade detalles, usos, segmentación..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, MAX_DESC))}
              rows={4}
              className={textareaClass() + ' min-h-[130px]'}
              disabled={readonly}
            />
            {nearLimit && (
              <div className="absolute bottom-2 right-3 text-[10px] font-semibold text-amber-600">Cerca del límite</div>
            )}
          </div>
          <progress
            value={descLength}
            max={MAX_DESC}
            aria-label="Progreso de longitud de descripción"
            className={`w-full h-1.5 overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-300
              ${percent === 100
                ? '[&::-webkit-progress-value]:bg-red-700'
                : nearLimit
                  ? '[&::-webkit-progress-value]:bg-amber-500'
                  : '[&::-webkit-progress-value]:bg-red-500'}
              ${percent === 100 ? 'animate-pulse' : ''}
            `}
          />
        </div>

        {/* Error global */}
        {(error || success) && (
          <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${error ? 'border-red-200 bg-red-50/80 text-red-700' : 'border-green-200 bg-green-50/90 text-green-700'}`}>
            {error ? (
              <svg className="h-5 w-5 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z"/></svg>
            ) : (
              <svg className="h-5 w-5 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            )}
            <span className="font-medium">{error || success}</span>
          </div>
        )}

        {/* Acciones */}
  <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-1">
          {!readonly && (
          <button
            type="button"
            onClick={reset}
            className={secondaryButton}
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4 9a9 9 0 0113.446-3.414M20 15a9 9 0 00-13.446 3.414" /></svg>
            Reiniciar
          </button>) }
          {!readonly && (
          <button
            type="submit"
            disabled={saving || !trimmedName}
            className={actionButtonPrimary(saving || !trimmedName)}
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            )}
            {saving ? 'Guardando…' : submitLabel}
            {!trimmedName && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition">
                Ingresa un nombre válido
              </span>
            )}
          </button>) }
        </div>
      </form>
    </div>
  );
}

