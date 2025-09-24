import React, { useCallback, useState } from 'react';
import Loading from '../components/Loading';
import { LoadingContext } from './loadingContext';

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<{ text?: string; overlay?: boolean; size?: 'sm' | 'md' | 'lg' }>({});

  const show = useCallback((o?: { text?: string; overlay?: boolean; size?: 'sm' | 'md' | 'lg' }) => {
    setOpts(o ?? {});
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    setOpts({});
  }, []);

  return (
    <LoadingContext.Provider value={{ show, hide }}>
      {children}
      <Loading open={open} overlay={opts.overlay ?? true} text={opts.text ?? 'Cargando...'} size={opts.size ?? 'md'} />
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
