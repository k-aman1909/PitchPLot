import React from 'react';

export const AudioVisualizer = ({ isListening, audioLevel = 0 }) => {
  // Generate 16 visualizer bars with dynamic heights
  const bars = Array.from({ length: 16 });

  return (
    <div className="flex items-center justify-center space-x-1.5 h-10 px-4 bg-gray-900/60 rounded-xl border border-gray-800">
      {bars.map((_, idx) => {
        // Calculate dynamic height based on audio level and bar position
        const modifier = Math.sin((idx / 16) * Math.PI);
        const basePercent = isListening ? Math.max(15, Math.round(audioLevel * modifier)) : 10;
        const randomFluctuation = isListening ? (idx % 2 === 0 ? 10 : -5) : 0;
        const heightPercent = Math.min(100, Math.max(10, basePercent + randomFluctuation));

        return (
          <div
            key={idx}
            className={`w-1 rounded-full transition-all duration-75 ${
              isListening
                ? 'bg-gradient-to-t from-brand-600 via-indigo-400 to-cyan-400 shadow-sm shadow-cyan-400/50'
                : 'bg-gray-700'
            }`}
            style={{ height: `${heightPercent}%` }}
          />
        );
      })}
    </div>
  );
};
