import React from 'react';

export const ProgressBar = ({ progress = 0, color = 'purple', height = 'h-2', showLabel = false }) => {
  const colors = {
    purple: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-400',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-400',
    rose: 'bg-gradient-to-r from-rose-600 to-pink-500',
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  };

  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-900 border border-white/10 rounded-full overflow-hidden ${height}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color] || colors.purple}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
