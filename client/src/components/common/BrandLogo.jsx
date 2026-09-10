import React from 'react';

export const BrandLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 group ${className}`}>
      <div className={`${sizeClasses[size] || 'w-9 h-9'} rounded-xl bg-[#070B14] border border-purple-500/30 overflow-hidden shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center p-1`}>
        <img
          src="/slidesense-logo.png"
          alt="SlideSense Logo"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size] || 'text-lg'} font-extrabold text-slate-900 dark:text-white tracking-tight leading-none`}>
            SlideSense
          </span>
          <span className="text-[10px] font-bold text-[#6D4AFF] dark:text-purple-400 tracking-wider uppercase mt-0.5">
            AI Presentation Coach
          </span>
        </div>
      )}
    </div>
  );
};
