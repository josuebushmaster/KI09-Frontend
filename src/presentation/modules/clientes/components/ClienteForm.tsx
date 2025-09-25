import { useState, useMemo } from 'react';
import type { Cliente } from '../../../../domain/entities';

export type ClienteFormValues = Partial<Cliente> & { nombre: string };

interface Props {
  initial?: Partial<Cliente>;
  onSubmit: (payload: ClienteFormValues) => Promise<void> | void;
  submitLabel?: string;
}

// Límites razonables
const MAX_NOMBRE = 120;
const MAX_EMAIL = 180;
const MAX_TELEFONO = 40;
const MAX_DIRECCION = 255;

export default function ClienteForm({ initial = {}, onSubmit, submitLabel = 'Guardar' }: Props) {
  const [nombre, setNombre] = useState(String(initial.nombre ?? ''));
  const [email, setEmail] = useState(String(initial.email ?? ''));
  const [telefono, setTelefono] = useState(String(initial.telefono ?? ''));
  const [direccion, setDireccion] = useState(String(initial.direccion ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const trimmedNombre = useMemo(() => nombre.trim(), [nombre]);
  const trimmedEmail = useMemo(() => email.trim(), [email]);
  const trimmedTelefono = useMemo(() => telefono.trim(), [telefono]);
  const trimmedDireccion = useMemo(() => direccion.trim(), [direccion]);

  const invalidNombre = touched && !trimmedNombre;
  const invalidEmail = !!trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const invalidTelefono = !!trimmedTelefono && trimmedTelefono.length < 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setTouched(true);
    setError(null);
    if (!trimmedNombre || invalidEmail || invalidTelefono) return;
    setSaving(true);
    try {
      await onSubmit({
        nombre: trimmedNombre.substring(0, MAX_NOMBRE),
        email: trimmedEmail ? trimmedEmail.substring(0, MAX_EMAIL) : undefined,
        telefono: trimmedTelefono ? trimmedTelefono.substring(0, MAX_TELEFONO) : undefined,
        direccion: trimmedDireccion ? trimmedDireccion.substring(0, MAX_DIRECCION) : undefined,
        id_cliente: initial.id_cliente,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setNombre('');
    setEmail('');
    setTelefono('');
    setDireccion('');
    setError(null);
    setTouched(false);
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-red-700/40 via-red-800/30 to-red-900/50 blur-sm opacity-70" aria-hidden="true" />
      <form onSubmit={handleSubmit} className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl px-8 py-8 space-y-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),rgba(255,255,255,0))]" aria-hidden />
        <header className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
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
            className={`peer w-full rounded-xl border bg-white/60 backdrop-blur px-5 pt-6 pb-2 text-sm font-medium tracking-wide outline-none transition-all shadow-sm focus:ring-2 focus:ring-red-500/30 focus:border-red-600 placeholder-transparent ${invalidNombre ? 'border-red-400 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'}`}
            autoComplete="off"
          />
          <label
            htmlFor="cliente-nombre"
            className={`pointer-events-none absolute left-4 top-2.5 text-[11px] uppercase tracking-wider font-semibold transition-all px-1 rounded-md ${invalidNombre ? 'text-red-600' : 'text-gray-500 peer-focus:text-red-700'} peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-400 peer-placeholder-shown:uppercase peer-placeholder-shown:tracking-normal peer-placeholder-shown:bg-transparent peer-focus:top-2.5 peer-focus:text-[11px] peer-focus:tracking-wider peer-focus:uppercase bg-white/80 backdrop-blur`}
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

        {/* Email & Teléfono */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="relative">
              <input
                id="cliente-email"
                placeholder="correo@dominio.com"
                value={email}
                maxLength={MAX_EMAIL}
                onChange={(e) => setEmail(e.target.value)}
                className={`peer w-full rounded-xl border bg-white/60 backdrop-blur px-5 pt-6 pb-2 text-sm font-medium tracking-wide outline-none transition-all shadow-sm focus:ring-2 focus:ring-red-500/30 focus:border-red-600 placeholder-transparent ${(invalidEmail) ? 'border-red-400 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'}`}
                autoComplete="off"
              />
              <label htmlFor="cliente-email" className={`pointer-events-none absolute left-4 top-2.5 text-[11px] uppercase tracking-wider font-semibold transition-all px-1 rounded-md ${invalidEmail ? 'text-red-600' : 'text-gray-500 peer-focus:text-red-700'} peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-400 peer-placeholder-shown:uppercase peer-placeholder-shown:tracking-normal peer-placeholder-shown:bg-transparent peer-focus:top-2.5 peer-focus:text-[11px] peer-focus:tracking-wider peer-focus:uppercase bg-white/80 backdrop-blur`}>Email</label>
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
                className={`peer w-full rounded-xl border bg-white/60 backdrop-blur px-5 pt-6 pb-2 text-sm font-medium tracking-wide outline-none transition-all shadow-sm focus:ring-2 focus:ring-red-500/30 focus:border-red-600 placeholder-transparent ${(invalidTelefono) ? 'border-red-400 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'}`}
                autoComplete="off"
              />
              <label htmlFor="cliente-telefono" className={`pointer-events-none absolute left-4 top-2.5 text-[11px] uppercase tracking-wider font-semibold transition-all px-1 rounded-md ${invalidTelefono ? 'text-red-600' : 'text-gray-500 peer-focus:text-red-700'} peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-400 peer-placeholder-shown:uppercase peer-placeholder-shown:tracking-normal peer-placeholder-shown:bg-transparent peer-focus:top-2.5 peer-focus:text-[11px] peer-focus:tracking-wider peer-focus:uppercase bg-white/80 backdrop-blur`}>Teléfono</label>
              <div className="mt-1 min-h-[18px] text-xs">
                {invalidTelefono ? <span className="text-red-600 font-medium">Mínimo 6 caracteres.</span> : <span className="text-gray-400">Opcional.</span>}
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
              className="w-full rounded-xl border border-gray-300 bg-white/60 backdrop-blur px-5 py-3 text-sm leading-relaxed outline-none resize-y min-h-[110px] shadow-sm focus:border-red-600 focus:ring-2 focus:ring-red-500/20 transition"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm">
            <svg className="h-5 w-5 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z"/></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white/60 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 hover:shadow transition focus:outline-none focus:ring-2 focus:ring-red-400/30"
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4 9a9 9 0 0113.446-3.414M20 15a9 9 0 00-13.446 3.414" /></svg>
            Reiniciar
          </button>
          <button
            type="submit"
            disabled={saving || !trimmedNombre || invalidEmail || invalidTelefono}
            className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-red-600 to-red-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-700/25 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition group"
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
        </div>
      </form>
    </div>
  );
}
