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
  <div className="px-5 pt-2 pb-6 lg:px-8 lg:pt-3 lg:pb-8 max-w-5xl mx-auto space-y-4">
  <div className="flex flex-col gap-2">
  <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3.5 py-1.5 text-[13px] font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400/30 transition group"
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {backLabel}
          </button>
          <h1 className="text-[1.45rem] font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            {title}
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-red-700 text-white text-[11px] shadow-md">📝</span>
          </h1>
        </div>
        {subtitle && <p className="text-[13px] text-gray-600 max-w-prose leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
