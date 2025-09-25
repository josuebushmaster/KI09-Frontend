import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className={`transition-all duration-300 ${isMobile ? 'ml-0' : 'ml-64'}`}>
        <div className={`p-6 ${isMobile ? 'pt-20' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
