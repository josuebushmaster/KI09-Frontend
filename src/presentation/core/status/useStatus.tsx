import { useContext } from 'react';
import { StatusContext } from '../status/statusContext';

export const useStatus = () => {
  const ctx = useContext(StatusContext);
  if (!ctx) throw new Error('useStatus must be used within StatusProvider');
  return ctx;
};

export default useStatus;
