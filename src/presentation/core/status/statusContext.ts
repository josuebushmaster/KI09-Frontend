import { createContext } from 'react';

export type Variant = 'error' | 'success' | 'info';

export interface ShowOptions {
  title?: string;
  message?: string;
  detail?: unknown;
  variant?: Variant;
}

export interface StatusContextValue {
  show: (opts: ShowOptions) => void;
  hide: () => void;
}

export const StatusContext = createContext<StatusContextValue | null>(null);

export default StatusContext;
