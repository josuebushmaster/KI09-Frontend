import { useContext } from 'react';
import type { ToastContextValue } from './toastContext';
import { ToastContext } from './toastContext';

export function useToast() {
  const ctx = useContext(ToastContext as any) as ToastContextValue | null;
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default useToast;
