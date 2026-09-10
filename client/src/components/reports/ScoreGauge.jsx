import React from 'react';

export const ScoreGauge = ({ score = 85, label = 'Overall Score', size = 'lg' }) => {
  const rounded = Math.min(100, Math.max(0, Math.round(score)));
  const radius = size === 'lg' ? 68 : 45;
  const strokeWidth = size === 'lg' ? 12 : 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rounded / 100) * circumference;

  let strokeColor = '#7C3AED';
  if (rounded < 65) strokeColor = '#EF4444';
  else if (rounded < 82) strokeColor = '#F59E0B';
  else strokeColor = '#7C3AED';

  const dimensions = size === 'lg' ? 170 : 120;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg width={dimensions} height={dimensions} className="transform -rotate-90">
          {/* Track Circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            stroke="currentColor"
            className="text-slate-200 dark:text-white/10"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-extrabold text-slate-900 dark:text-white tracking-tight ${size === 'lg' ? 'text-4xl' : 'text-2xl'}`}>
            {rounded}
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 -mt-1 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      {label && (
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2 text-center">
          {label}
        </span>
      )}
    </div>
  );
};
