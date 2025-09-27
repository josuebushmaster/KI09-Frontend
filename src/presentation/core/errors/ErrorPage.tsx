import type { FC } from 'react';
import { Link } from 'react-router-dom';

interface ErrorPageProps {
  code?: number | string;
  title?: string;
  message?: string;
  actionLabel?: string;
  actionTo?: string;
  variant?: 'dark' | 'light';
}

const ErrorPage: FC<ErrorPageProps> = ({
  code = 500,
  title = 'Ocurrió un error',
  message = 'Lo sentimos, algo salió mal.',
  actionLabel = 'Volver al inicio',
  actionTo = '/',
  variant = 'light'
}) => {
  const dark = variant === 'dark';
  return (
    <div className={`min-h-[70vh] flex items-center justify-center px-4 py-10 ${dark ? 'bg-gray-950 text-gray-100' : 'bg-transparent'}`}>      
      <div className={`w-full max-w-5xl grid md:grid-cols-2 rounded-2xl overflow-hidden border ${dark ? 'border-gray-800 bg-gray-900/60' : 'border-gray-200 bg-white/80 backdrop-blur'} shadow`}>        
        <div className="p-10 flex flex-col">
          <div className="mb-8">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${dark ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}> 
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75M12 15h.007M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
            </div>
          </div>
          <p className="text-xs font-semibold tracking-wider text-indigo-500 mb-4">{code}</p>
          <h1 className={`text-3xl font-bold tracking-tight mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
          <p className={`text-sm leading-relaxed mb-8 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{message}</p>
          <div className="mt-auto">
            <Link
              to={actionTo}
              className={`inline-flex items-center gap-2 text-sm font-medium transition px-4 py-2 rounded-md shadow ${dark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              <span>{actionLabel}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
            <div className={`mt-10 flex items-center gap-4 text-[11px] font-medium ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              <a href="mailto:contacto@example.com" className="hover:text-indigo-500 transition-colors">Soporte</a>
              <span className="opacity-30">•</span>
              <a href="/status" className="hover:text-indigo-500 transition-colors">Status</a>
            </div>
          </div>
        </div>
        <div className="hidden md:block relative">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#0f172a_0%,#1e293b_50%,#312e81_100%)] opacity-90" />
          <img
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Error illustration"
            className="h-full w-full object-cover mix-blend-overlay"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: FC = () => (
  <ErrorPage
    code={404}
    title="Página no encontrada"
    message="No pudimos encontrar el recurso que buscas. Verifica la URL o regresa al inicio."
    actionLabel="Volver al inicio"
    actionTo="/"
    variant="dark"
  />
);

export default ErrorPage;
