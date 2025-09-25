import React from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: Error | null; }
interface ErrorBoundaryProps { children: React.ReactNode; fallback?: React.ReactNode; }

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('UI error boundary catch:', error, info);
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white/80 backdrop-blur rounded-xl border border-gray-200 shadow-sm p-8 text-center">            
            <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-800 mb-2">Se produjo un error</h1>
            <p className="text-sm text-gray-500 mb-6">Ha ocurrido un error inesperado en la interfaz. Puedes intentar recargar la página o volver al inicio.</p>
            {this.state.error && (
              <pre className="text-left text-xs bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-48 mb-6">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={this.reset} className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-700">Reintentar</button>
              <a href="/" className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:border-gray-400">Ir al inicio</a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
