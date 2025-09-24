import React from 'react';

interface StatusModalProps {
  open: boolean;
  title?: string;
  message?: string;
  detail?: unknown;
  variant?: 'error' | 'success' | 'info';
  onClose: () => void;
}

const variantColors: Record<NonNullable<StatusModalProps['variant']>, string> = {
  error: 'bg-red-600',
  success: 'bg-green-600',
  info: 'bg-blue-600',
};

const StatusModal: React.FC<StatusModalProps> = ({ open, title = 'Estado', message, detail, variant = 'error', onClose }) => {
  if (!open) return null;

  const handleCopy = async () => {
    try {
      const text = typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2);
      await navigator.clipboard.writeText(text);
      // small feedback could be added; for now console
      console.debug('Detalle copiado al portapapeles');
    } catch (e) {
      console.error('No se pudo copiar', e);
    }
  };

  const hasDetail = detail !== undefined && detail !== null;
  const content = hasDetail ? (typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2)) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="z-10 max-w-lg w-full mx-4">
        <div className="bg-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-5 flex items-start gap-4">
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${variantColors[variant]}`}>
              {variant === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.516 9.807c.75 1.333-.213 2.994-1.742 2.994H4.483c-1.53 0-2.492-1.661-1.742-2.994L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {variant === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {variant === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-9-4a1 1 0 112 0v2a1 1 0 11-2 0V6zm1 4a1 1 0 00-.993.883L9 11v3a1 1 0 001.993.117L11 14v-3a1 1 0 00-1-1z" />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold">{title}</h4>
                  {message && <p className="text-sm text-gray-300 mt-1">{message}</p>}
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-200">Cerrar</button>
              </div>

              {hasDetail && (
                <>
                  <div className="mt-4 bg-gray-800 rounded p-3 text-xs text-gray-200 max-h-56 overflow-auto">
                    <pre className="whitespace-pre-wrap">{content}</pre>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button onClick={handleCopy} className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm">Copiar detalle</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
