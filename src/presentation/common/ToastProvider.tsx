import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ToastContext } from './toastContext';
import type { Toast } from './toastContext';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = { id, duration: 4000, ...t };
    setToasts((s) => [...s, toast]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers: number[] = [];
    toasts.forEach((t) => {
      if (t.duration && t.duration > 0) {
        const timer = window.setTimeout(() => {
          setToasts((s) => s.filter((x) => x.id !== t.id));
        }, t.duration);
        timers.push(timer);
      }
    });
    return () => timers.forEach((id) => clearTimeout(id));
  }, [toasts]);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 bottom-6 z-60 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className="rounded-lg bg-neutral-900/95 px-4 py-3 text-white shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {t.title && <div className="font-semibold">{t.title}</div>}
                {t.description && <div className="text-sm text-neutral-200">{t.description}</div>}
              </div>
              {t.action ? (
                <button
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="ml-2 rounded-md bg-white/10 px-3 py-1 text-sm font-medium text-white/90"
                >
                  {t.action.label}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export default ToastProvider;
