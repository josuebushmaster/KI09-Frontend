import React from 'react';

interface LoadingProps {
  open?: boolean;
  overlay?: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<NonNullable<LoadingProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const Loading: React.FC<LoadingProps> = ({ open = true, overlay = true, text = 'Cargando...', size = 'md' }) => {
  if (!open) return null;

  const spinnerSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className="flex items-center space-x-3">
      <svg className={`${spinnerSize} animate-spin text-blue-600`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <span className="text-sm text-gray-700 dark:text-gray-200">{text}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading;
