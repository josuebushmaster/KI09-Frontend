import { useEffect } from 'react';

export default function Toast({ message, onClose }: { message: string; onClose?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), 2600);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div aria-live="polite" className="fixed top-4 right-4 z-50">
      <div className="bg-red-600 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
        {message}
      </div>
    </div>
  );
}
