import React from 'react';

export const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card backdrop-blur-md rounded-2xl border border-border p-4 shadow-lg ${
        hover ? 'hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(123,97,255,0.15)] transition-all cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
