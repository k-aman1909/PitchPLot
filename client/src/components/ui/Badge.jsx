import React from 'react';

export const Badge = ({ children, variant = 'purple', size = 'sm', className = '' }) => {
  const variants = {
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    gray: 'bg-slate-800 text-slate-300 border-white/10',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs font-bold',
    md: 'px-3 py-1 text-xs font-bold',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${variants[variant] || variants.purple} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
