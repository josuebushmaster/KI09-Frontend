import { useContext } from 'react';
import { LoadingContext } from './loadingContext';

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
};

export default useLoading;
