import React, { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') {
        // avoid accidental enter presses if loading
        if (!loading) onConfirm();
      }
    };
    document.addEventListener('keydown', onKey);
    // autofocus confirm for quick keyboard action
    setTimeout(() => confirmRef.current?.focus(), 0);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel, onConfirm, loading]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="z-10 max-w-md w-full mx-4 transform transition-all duration-200 ease-out scale-100"
      >
        <div className="bg-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M6.938 4h10.124a2 2 0 011.99 2.253l-1.2 8.5A2 2 0 0116.864 17H7.136a2 2 0 01-1.989-1.247l-1.2-8.5A2 2 0 016.938 4z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 id="confirm-modal-title" className="text-lg font-semibold text-white">{title}</h3>
              {description && <p className="text-sm text-gray-300 mt-2">{description}</p>}

              <div className="mt-6 flex justify-end items-center gap-3">
                <button
                  onClick={onCancel}
                  className="px-5 py-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-shadow shadow-sm"
                >
                  {cancelLabel}
                </button>

                <button
                  ref={confirmRef}
                  onClick={onConfirm}
                  disabled={loading}
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-60 transition-shadow shadow-md"
                >
                  {loading ? 'Eliminando...' : confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
