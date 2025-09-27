import { useContext } from 'react';
import { LoadingContext } from './loadingContext';

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading debe ser usado dentro de LoadingProvider');
  return ctx;
};

export default useLoading;
