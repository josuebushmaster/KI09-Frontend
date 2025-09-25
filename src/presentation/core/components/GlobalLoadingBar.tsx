import React from 'react';

interface GlobalLoadingBarProps { visible: boolean; }

const GlobalLoadingBar: React.FC<GlobalLoadingBarProps> = ({ visible }) => {
  return (
    <div
      role="presentation"
      className={`fixed top-0 left-0 right-0 h-0.5 z-[60] overflow-hidden transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="h-full w-full bg-gradient-to-r from-red-600 via-rose-400 to-red-700 animate-global-loading-bar" />
    </div>
  );
};

export default GlobalLoadingBar;
