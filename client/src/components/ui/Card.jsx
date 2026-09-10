import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`rounded-2xl p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-sm transition-all duration-200 ${
        hover ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/50 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
