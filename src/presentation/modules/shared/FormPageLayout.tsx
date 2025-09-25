import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  subtitle?: string;
  backTo: string;
  backLabel?: string;
  children: ReactNode;
}

export default function FormPageLayout({ title, subtitle, backTo, backLabel = 'Volver', children }: Props) {
  const navigate = useNavigate();
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/70 backdrop-blur px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400/30 transition group"
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {backLabel}
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            {title}
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white text-sm shadow-md">📝</span>
          </h1>
        </div>
        {subtitle && <p className="text-sm text-gray-600 max-w-prose leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
