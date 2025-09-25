// Utilidades reutilizables para clases de formularios

export function inputClass(invalid?: boolean) {
  const base = 'peer w-full rounded-xl border bg-white/60 backdrop-blur px-5 pt-6 pb-2 text-sm font-medium tracking-wide outline-none transition-all shadow-sm focus:ring-2 focus:ring-red-500/30 focus:border-red-600 placeholder-transparent';
  return invalid ? `${base} border-red-400 focus:border-red-500` : `${base} border-gray-300 hover:border-gray-400`;
}

export function labelFloatClass(invalid?: boolean) {
  const base = 'pointer-events-none absolute left-4 top-2.5 text-[11px] uppercase tracking-wider font-semibold transition-all px-1 rounded-md bg-white/80 backdrop-blur';
  const states = invalid ? 'text-red-600' : 'text-gray-500 peer-focus:text-red-700';
  const placeholder = 'peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-400 peer-placeholder-shown:uppercase peer-placeholder-shown:tracking-normal peer-placeholder-shown:bg-transparent peer-focus:top-2.5 peer-focus:text-[11px] peer-focus:tracking-wider peer-focus:uppercase';
  return `${base} ${states} ${placeholder}`;
}

export function textareaClass() {
  return 'w-full rounded-xl border border-gray-300 bg-white/60 backdrop-blur px-5 py-3 text-sm leading-relaxed outline-none resize-y shadow-sm focus:border-red-600 focus:ring-2 focus:ring-red-500/20 transition';
}

export function actionButtonPrimary(disabled?: boolean) {
  const base = 'relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-red-600 to-red-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-700/25 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition group';
  return disabled ? `${base} disabled:opacity-50 disabled:cursor-not-allowed` : base;
}

export const secondaryButton = 'group inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white/60 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 hover:shadow transition focus:outline-none focus:ring-2 focus:ring-red-400/30';

export const subtleBadge = 'inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10';
