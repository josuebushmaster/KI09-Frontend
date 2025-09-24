import React from 'react';
import { StatusProvider } from './status';
import { LoadingProvider } from './loading';

interface ProvidersProps {
  children: React.ReactNode;
}

// Componer aquí todos los providers globales en el orden correcto.
const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <StatusProvider>
      <LoadingProvider>
        {children}
      </LoadingProvider>
    </StatusProvider>
  );
};

export default Providers;
