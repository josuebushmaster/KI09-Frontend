import React, { useCallback, useState } from 'react';
import StatusModal from '../components/StatusModal';
import { StatusContext } from './statusContext';

export const StatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [detail, setDetail] = useState<unknown | undefined>(undefined);
  const [variant, setVariant] = useState<'error' | 'success' | 'info'>('error');

  const show = useCallback((opts: { title?: string; message?: string; detail?: unknown; variant?: 'error' | 'success' | 'info' }) => {
    setTitle(opts.title);
    setMessage(opts.message);
    setDetail(opts.detail);
    setVariant(opts.variant ?? 'error');
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    setTitle(undefined);
    setMessage(undefined);
    setDetail(undefined);
  }, []);

  return (
    <StatusContext.Provider value={{ show, hide }}>
      {children}
      <StatusModal open={open} title={title} message={message} detail={detail} variant={variant} onClose={hide} />
    </StatusContext.Provider>
  );
};

export default StatusProvider;
