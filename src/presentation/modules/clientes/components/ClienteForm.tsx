import { useState, useMemo } from 'react';
import { inputClass, labelFloatClass, textareaClass, actionButtonPrimary, secondaryButton, subtleBadge } from '../../shared/formStyles';
import type { Cliente } from '../../../../domain/entities';

export type ClienteFormValues = Partial<Cliente> & { nombre: string };

interface Props {
  initial?: Partial<Cliente>;
  onSubmit: (payload: ClienteFormValues) => Promise<void> | void;
  submitLabel?: string;
  readonly?: boolean;
  showSuccessInline?: boolean;
}

// Límites razonables
const MAX_NOMBRE = 120;
const MAX_EMAIL = 180;
const MAX_TELEFONO = 40;
const MAX_DIRECCION = 255;

export default function ClienteForm({ initial = {}, onSubmit, submitLabel = 'Guardar', readonly = false, showSuccessInline = false }: Props) {
  const [nombre, setNombre] = useState(String(initial.nombre ?? ''));
  const [apellido, setApellido] = useState(String(initial.apellido ?? ''));
  const [email, setEmail] = useState(String(initial.email ?? ''));
  const [telefono, setTelefono] = useState(String(initial.telefono ?? ''));
  const [edad, setEdad] = useState(initial.edad !== undefined ? String(initial.edad) : '');
  const [direccion, setDireccion] = useState(String(initial.direccion ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const trimmedNombre = useMemo(() => nombre.trim(), [nombre]);
  const trimmedApellido = useMemo(() => apellido.trim(), [apellido]);
  const trimmedEmail = useMemo(() => email.trim(), [email]);
  const trimmedTelefono = useMemo(() => telefono.trim(), [telefono]);
  const trimmedEdad = useMemo(() => edad.trim(), [edad]);
  // Normalización: permitir '+' inicial, remover otros símbolos no numéricos
  const normalizedTelefono = useMemo(() => {
    if (!trimmedTelefono) return '';
    const hasPlus = trimmedTelefono.startsWith('+');
    const digits = trimmedTelefono.replace(/[^0-9]/g, '');
    return (hasPlus ? '+' : '') + digits;
  }, [trimmedTelefono]);
  const trimmedDireccion = useMemo(() => direccion.trim(), [direccion]);

  const invalidNombre = touched && !trimmedNombre;
  const invalidEmail = !!trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const invalidTelefono = !!normalizedTelefono && normalizedTelefono.replace(/[^0-9]/g, '').length < 6;
  const parsedEdad = useMemo(() => {
    const n = Number(trimmedEdad);
    return Number.isFinite(n) ? n : NaN;
  }, [trimmedEdad]);
  const invalidEdad = !!trimmedEdad && isNaN(parsedEdad);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || readonly) return;
    setTouched(true);
    setError(null);
    setSuccess(null);
    if (!trimmedNombre || invalidEmail || invalidTelefono) return;
    setSaving(true);
    try {
      await onSubmit({
        nombre: trimmedNombre.substring(0, MAX_NOMBRE),
        apellido: trimmedApellido ? trimmedApellido.substring(0, MAX_NOMBRE) : undefined,
        edad: !isNaN(parsedEdad) ? parsedEdad : undefined,
        email: trimmedEmail ? trimmedEmail.substring(0, MAX_EMAIL) : undefined,
        telefono: normalizedTelefono ? normalizedTelefono.substring(0, MAX_TELEFONO) : undefined,
        direccion: trimmedDireccion ? trimmedDireccion.substring(0, MAX_DIRECCION) : undefined,
        id_cliente: initial.id_cliente,
      });
      if (showSuccessInline) {
        setSuccess(initial?.id_cliente ? 'Cambios guardados correctamente.' : 'Cliente creado con éxito.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setNombre('');
    setApellido('');
    setEmail('');
    setTelefono('');
    setEdad('');
    setDireccion('');
    setError(null);
    setTouched(false);
  };

  // Máscara visual para teléfono: +XX XXX XXX XXX
  const maskedTelefono = useMemo(() => {
    if (!normalizedTelefono) return '';
    const digits = normalizedTelefono.replace(/[^0-9]/g, '');
    if (!digits) return normalizedTelefono.startsWith('+') ? '+' : '';
    // Agrupar: (país 2-3) luego bloques de 3
    const countryLen = digits.length > 11 ? 3 : 2;
    const country = digits.slice(0, countryLen);
    const rest = digits.slice(countryLen);
    const groups = rest.match(/.{1,3}/g) ?? [];
    return (normalizedTelefono.startsWith('+') ? '+' : '') + country + (groups.length ? ' ' + groups.join(' ') : '');
  }, [normalizedTelefono]);

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-red-700/40 via-red-800/30 to-red-900/50 blur-sm opacity-70" aria-hidden="true" />
      <form onSubmit={handleSubmit} className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl px-8 py-8 space-y-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),rgba(255,255,255,0))]" aria-hidden />
        <header className="space-y-2 relative z-10">
          <div className={subtleBadge}>
            {initial?.id_cliente ? 'Edición' : 'Nuevo'} cliente
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            {initial?.id_cliente ? 'Editar Cliente' : 'Crear Cliente'}
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white text-sm shadow-md">
              {initial?.id_cliente ? '✏️' : '＋'}
            </span>
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-prose">
            {initial?.id_cliente ? 'Actualiza los datos del cliente y guarda los cambios. Los campos son validados en tiempo real.' : 'Completa la información para registrar un nuevo cliente.'}
          </p>
        </header>

        {/* Nombre */}
        <div className="relative">
          <input
            id="cliente-nombre"
            placeholder="Nombre completo"
            value={nombre}
            maxLength={MAX_NOMBRE}
            onChange={(e) => setNombre(e.target.value)}
            onBlur={() => setTouched(true)}
            className={inputClass(invalidNombre)}
            autoComplete="off"
            disabled={readonly}
          />
          <label
            htmlFor="cliente-nombre"
            className={labelFloatClass(invalidNombre)}
          >Nombre</label>
          <div className="mt-1 min-h-[18px] text-xs">
            {invalidNombre ? (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" /></svg>
                El nombre es obligatorio.
              </span>
            ) : (
              <span className="text-gray-400">Requerido. Máx. {MAX_NOMBRE} caracteres.</span>
            )}
          </div>
        </div>

        {/* Apellido */}
        <div className="relative">
          <input
            id="cliente-apellido"
            placeholder="Apellido"
            value={apellido}
            maxLength={MAX_NOMBRE}
            onChange={e => setApellido(e.target.value)}
            onBlur={() => setTouched(true)}
            className={inputClass(false)}
            autoComplete="off"
            disabled={readonly}
          />
          <label htmlFor="cliente-apellido" className={labelFloatClass(false)}>Apellido</label>
          <div className="mt-1 min-h-[18px] text-xs">
            <span className="text-gray-400">Opcional.</span>
          </div>
        </div>

        {/* Email, Teléfono & Edad */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="relative">
              <input
                id="cliente-email"
                placeholder="correo@dominio.com"
                value={email}
                maxLength={MAX_EMAIL}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass(invalidEmail)}
                autoComplete="off"
                disabled={readonly}
              />
              <label htmlFor="cliente-email" className={labelFloatClass(invalidEmail)}>Email</label>
              <div className="mt-1 min-h-[18px] text-xs">
                {invalidEmail ? <span className="text-red-600 font-medium">Formato inválido.</span> : <span className="text-gray-400">Opcional.</span>}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <input
                id="cliente-telefono"
                placeholder="Teléfono"
                value={telefono}
                maxLength={MAX_TELEFONO}
                onChange={(e) => setTelefono(e.target.value)}
                className={inputClass(invalidTelefono)}
                autoComplete="off"
                disabled={readonly}
              />
              <label htmlFor="cliente-telefono" className={labelFloatClass(invalidTelefono)}>Teléfono</label>
              <div className="mt-1 min-h-[18px] text-xs">
                {invalidTelefono ? <span className="text-red-600 font-medium">Teléfono demasiado corto.</span> : maskedTelefono ? <span className="text-gray-500 font-medium">{maskedTelefono}</span> : <span className="text-gray-400">Opcional.</span>}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <input
                id="cliente-edad"
                type="number"
                placeholder="Edad"
                value={edad}
                onChange={e => setEdad(e.target.value)}
                onBlur={() => setTouched(true)}
                className={inputClass(invalidEdad)}
                autoComplete="off"
                disabled={readonly}
              />
              <label htmlFor="cliente-edad" className={labelFloatClass(invalidEdad)}>Edad</label>
              <div className="mt-1 min-h-[18px] text-xs">
                {invalidEdad
                  ? <span className="text-red-600 font-medium">Edad inválida.</span>
                  : <span className="text-gray-400">Opcional.</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="cliente-direccion" className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">Dirección (opcional)</label>
            <span className="text-[11px] font-semibold tabular-nums text-gray-400">{direccion.length}/{MAX_DIRECCION}</span>
          </div>
          <div className="relative group">
            <textarea
              id="cliente-direccion"
              placeholder="Calle, número, ciudad, referencia..."
              value={direccion}
              onChange={(e) => setDireccion(e.target.value.slice(0, MAX_DIRECCION))}
              rows={3}
              className={textareaClass() + ' min-h-[110px]'}
              disabled={readonly}
            />
          </div>
        </div>

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

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
          {!readonly && (
            <button type="button" onClick={reset} className={secondaryButton}>
              <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4 9a9 9 0 0113.446-3.414M20 15a9 9 0 00-13.446 3.414" /></svg>
              Reiniciar
            </button>
          )}
          {!readonly && (
            <button
              type="submit"
              disabled={saving || !trimmedNombre || invalidEmail || invalidTelefono}
              className={actionButtonPrimary(saving || !trimmedNombre || invalidEmail || invalidTelefono)}
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
              {!trimmedNombre && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition">
                  Ingresa un nombre válido
                </span>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
