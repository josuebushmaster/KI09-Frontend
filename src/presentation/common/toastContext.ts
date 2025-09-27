import { createContext, useContext } from 'react';

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
};

export type ToastContextValue = {
  push: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastContext;
