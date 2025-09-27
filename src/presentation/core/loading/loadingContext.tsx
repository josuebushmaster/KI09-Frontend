/* eslint-disable react-refresh/only-export-components */
import { createContext } from 'react';

export interface LoadingOptions {
  text?: string;
  overlay?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface LoadingContextValue {
  show: (opts?: LoadingOptions) => void;
  hide: () => void;
}

export const LoadingContext = createContext<LoadingContextValue | null>(null);

export default LoadingContext;
