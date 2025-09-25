import React, { useCallback, useEffect, useRef, useState } from 'react';
import Loading from '../components/Loading';
import { LoadingContext } from './loadingContext';
import { subscribeGlobalLoading } from '../../../shared/globalLoadingBus';
import GlobalLoadingBar from '../components/GlobalLoadingBar.tsx';

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

  const [barVisible, setBarVisible] = useState(false);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeGlobalLoading((active) => {
      if (active) {
        if (hideTimer.current) { window.clearTimeout(hideTimer.current); hideTimer.current = null; }
        if (!barVisible && showTimer.current == null) {
          showTimer.current = window.setTimeout(() => {
            setBarVisible(true);
            showTimer.current = null;
          }, 120);
        }
      } else {
        if (showTimer.current) { window.clearTimeout(showTimer.current); showTimer.current = null; }
        if (barVisible) {
          if (hideTimer.current) window.clearTimeout(hideTimer.current);
          hideTimer.current = window.setTimeout(() => {
            setBarVisible(false);
            hideTimer.current = null;
          }, 250);
        }
      }
    });
    return () => {
      unsubscribe();
      if (showTimer.current) window.clearTimeout(showTimer.current);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [barVisible]);

  return (
    <LoadingContext.Provider value={{ show, hide }}>
      <GlobalLoadingBar visible={barVisible} />
      {children}
      <Loading open={open} overlay={opts.overlay ?? true} text={opts.text ?? 'Cargando...'} size={opts.size ?? 'md'} />
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
