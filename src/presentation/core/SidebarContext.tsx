import React from 'react';

interface SidebarProviderProps {
  children: React.ReactNode;
}

// Componente placeholder para SidebarProvider. El estado se maneja en Layout.
export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export default SidebarProvider;