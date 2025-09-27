import { useState, useMemo } from 'react';
import { inputClass, labelFloatClass, textareaClass, actionButtonPrimary, secondaryButton, subtleBadge } from '../../shared/formStyles';
import type { Producto } from '../../../../domain/entities';

export type ProductoFormValues = Partial<Producto>;

type Props = {
  initial?: Partial<Producto>;
  onSubmit: (payload: ProductoFormValues) => Promise<void> | void;
  submitLabel?: string;
  readonly?: boolean;
  showSuccessInline?: boolean;
};

// Límites para validación
const MAX_DESC = 500;
const MAX_NOMBRE = 100;

export default function ProductoForm({ initial = {}, onSubmit, submitLabel = 'Guardar', readonly = false, showSuccessInline = false }: Props) {
  const [nombre, setNombre] = useState(String(initial.nombre_producto ?? ''));
  const [descripcion, setDescripcion] = useState(String(initial.descripcion ?? ''));
  const [precio, setPrecio] = useState(String(initial.precio ?? ''));
  const [costo, setCosto] = useState(String(initial.costo ?? ''));
  const [stock, setStock] = useState(String(initial.stock ?? ''));
  const [categoria, setCategoria] = useState(String(initial.id_categoria ?? ''));
  const [imagenUrl, setImagenUrl] = useState(String(initial.imagen_url ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const trimmedName = useMemo(() => nombre.trim(), [nombre]);
  const trimmedDesc = useMemo(() => descripcion.trim(), [descripcion]);
  const descLength = descripcion.length;
  const nearLimit = descLength > MAX_DESC * 0.85;
  const percent = Math.min(100, Math.round((descLength / MAX_DESC) * 100));

  const precioNum = useMemo(() => {
    const val = parseFloat(precio);
    return isNaN(val) || val < 0 ? 0 : val;
  }, [precio]);

  const costoNum = useMemo(() => {
    const val = parseFloat(costo);
    return isNaN(val) || val < 0 ? undefined : val;
  }, [costo]);

  const stockNum = useMemo(() => {
    const val = parseInt(stock);
    return isNaN(val) || val < 0 ? undefined : val;
  }, [stock]);

  const categoriaNum = useMemo(() => {
    const val = parseInt(categoria);
    return isNaN(val) || val <= 0 ? undefined : val;
  }, [categoria]);

  const invalidName = touched && !trimmedName;
  const invalidPrecio = touched && (precio === '' || precioNum <= 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || readonly) return;
    setError(null);
    setSuccess(null);
    setTouched(true);
    if (!trimmedName || precioNum <= 0) return;
    setSaving(true);
    try {
      const payload: ProductoFormValues = {
        nombre_producto: trimmedName.substring(0, MAX_NOMBRE),
        descripcion: trimmedDesc ? trimmedDesc.substring(0, MAX_DESC) : null,
        precio: precioNum,
        costo: costoNum,
        stock: stockNum,
        id_categoria: categoriaNum,
        imagen_url: imagenUrl.trim() || undefined,
      };
      await onSubmit(payload);
      if (showSuccessInline) {
        setSuccess(initial?.id_producto ? 'Cambios guardados correctamente.' : 'Producto creado con éxito.');
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
    setPrecio('');
    setCosto('');
    setStock('');
    setCategoria('');
    setImagenUrl('');
    setError(null);
    setTouched(false);
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-orange-700/40 via-orange-800/30 to-orange-900/50 blur-sm opacity-60" aria-hidden="true" />
      <form
        onSubmit={handleSubmit}
        className="relative rounded-xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-lg px-6 py-6 space-y-6 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),rgba(255,255,255,0))]" aria-hidden />

        <header className="space-y-1.5 relative z-10">
          <div className={subtleBadge}>
            {initial?.id_producto ? 'Edición' : 'Nuevo'} producto
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            {initial?.id_producto ? 'Editar Producto' : 'Crear Producto'}
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-600 to-orange-700 text-white text-sm shadow-md">
              {initial?.id_producto ? '✏️' : '＋'}
            </span>
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-prose">
            {initial?.id_producto
              ? 'Actualiza los datos del producto. Los campos marcados son obligatorios.'
              : 'Completa la información para registrar un nuevo producto en el inventario.'}
          </p>
        </header>

        {/* Mensajes de estado */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z"/></svg>
              <span className="text-sm font-medium text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && showSuccessInline && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-3">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 mt-0.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span className="text-sm font-medium text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Grid de campos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nombre del producto */}
          <div className="lg:col-span-2">
            <div className="relative">
              <input
                id="producto-nombre"
                aria-describedby="nombre-help"
                placeholder="Nombre del producto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onBlur={() => setTouched(true)}
                maxLength={MAX_NOMBRE}
                className={inputClass(invalidName)}
                autoComplete="off"
                disabled={readonly}
              />
              <label
                htmlFor="producto-nombre"
                className={labelFloatClass(invalidName)}
              >Nombre *</label>
              <div id="nombre-help" className="mt-1 min-h-[18px] text-xs">
                {invalidName ? (
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" /></svg>
                    El nombre es obligatorio.
                  </span>
                ) : (
                  <span className="text-gray-400">Requerido. Máx. {MAX_NOMBRE} caracteres.</span>
                )}
              </div>
            </div>
          </div>

          {/* Precio */}
          <div className="relative">
            <input
              id="producto-precio"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              onBlur={() => setTouched(true)}
              className={inputClass(invalidPrecio)}
              disabled={readonly}
            />
            <label
              htmlFor="producto-precio"
              className={labelFloatClass(invalidPrecio)}
            >Precio de venta *</label>
            <div className="mt-1 min-h-[18px] text-xs">
              {invalidPrecio ? (
                <span className="text-red-600 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" /></svg>
                  Ingresa un precio válido.
                </span>
              ) : (
                <span className="text-gray-400">Precio mayor a 0.</span>
              )}
            </div>
          </div>

          {/* Costo */}
          <div className="relative">
            <input
              id="producto-costo"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              className={inputClass(false)}
              disabled={readonly}
            />
            <label
              htmlFor="producto-costo"
              className={labelFloatClass(false)}
            >Costo</label>
            <div className="mt-1 min-h-[18px] text-xs">
              <span className="text-gray-400">Opcional. Costo del producto.</span>
            </div>
          </div>

          {/* Stock */}
          <div className="relative">
            <input
              id="producto-stock"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={inputClass(false)}
              disabled={readonly}
            />
            <label
              htmlFor="producto-stock"
              className={labelFloatClass(false)}
            >Stock inicial</label>
            <div className="mt-1 min-h-[18px] text-xs">
              <span className="text-gray-400">Cantidad disponible.</span>
            </div>
          </div>

          {/* Categoría */}
          <div className="relative">
            <input
              id="producto-categoria"
              type="number"
              min="1"
              step="1"
              placeholder="ID Categoría"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={inputClass(false)}
              disabled={readonly}
            />
            <label
              htmlFor="producto-categoria"
              className={labelFloatClass(false)}
            >ID Categoría</label>
            <div className="mt-1 min-h-[18px] text-xs">
              <span className="text-gray-400">ID de categoría existente.</span>
            </div>
          </div>

          {/* URL de imagen */}
          <div className="lg:col-span-2">
            <div className="relative">
              <input
                id="producto-imagen"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                className={inputClass(false)}
                disabled={readonly}
              />
              <label
                htmlFor="producto-imagen"
                className={labelFloatClass(false)}
              >URL de imagen</label>
              <div className="mt-1 min-h-[18px] text-xs">
                <span className="text-gray-400">URL de la imagen del producto.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción con contador */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="producto-descripcion" className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">Descripción (opcional)</label>
            <span className={`text-[11px] font-semibold tabular-nums ${nearLimit ? 'text-amber-600' : 'text-gray-400'}`}>{descLength}/{MAX_DESC}</span>
          </div>
          <div className="relative group">
            <textarea
              id="producto-descripcion"
              placeholder="Describe el producto, características, beneficios..."
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
                  : '[&::-webkit-progress-value]:bg-orange-600'
              }`}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {initial && initial.id_producto && !readonly && (
            <button
              type="button"
              onClick={reset}
              disabled={saving}
              className={secondaryButton}
            >
              <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4 9a9 9 0 0113.446-3.414M20 15a9 9 0 00-13.446 3.414" /></svg>
              Reiniciar
            </button>
          )}
          {!readonly && (
            <button
              type="submit"
              disabled={saving || !trimmedName || precioNum <= 0}
              className={actionButtonPrimary(saving || !trimmedName || precioNum <= 0)}
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
              {(!trimmedName || precioNum <= 0) && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition">
                  Completa los campos obligatorios
                </span>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}