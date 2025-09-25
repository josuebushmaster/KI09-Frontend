import { useContext } from 'react';
import { StatusContext } from '../status/statusContext';

export const useStatus = () => {
  const ctx = useContext(StatusContext);
  if (!ctx) throw new Error('useStatus debe ser usado dentro de StatusProvider');
  return ctx;
};

export default useStatus;
