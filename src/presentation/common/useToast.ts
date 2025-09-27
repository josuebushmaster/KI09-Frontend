import { useContext } from 'react';
import type { ToastContextValue } from './types';
import { ToastContext } from './types';

export function useToast() {
  const ctx = useContext(ToastContext as any) as ToastContextValue | null;
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default useToast;
