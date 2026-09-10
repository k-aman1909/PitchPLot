import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const FillerWordsTable = ({ metrics = {} }) => {
  const breakdown = metrics.fillerWordsBreakdown || [];
  const totalCount = metrics.fillerWordCount || 0;
  const percentage = metrics.fillerWordPercentage || 0;

  return (
    <Card className="p-6 bg-white border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Filler Word Analysis
            {totalCount === 0 ? (
              <Badge variant="emerald" size="sm">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Clean Speech
              </Badge>
            ) : (
              <Badge variant="amber" size="sm">
                <AlertCircle className="w-3.5 h-3.5 mr-1" /> {totalCount} Identified
              </Badge>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Filler words reduce perceived authority and confidence. Aim for less than 2% of total speech.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Fillers</span>
            <span className="text-base font-extrabold text-amber-600">{totalCount}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Speech Ratio</span>
            <span className="text-base font-extrabold text-slate-900">{percentage}%</span>
          </div>
        </div>
      </div>

      {breakdown.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-500 border-b border-slate-100 font-bold">
                <th className="py-2.5 px-3">Filler Word</th>
                <th className="py-2.5 px-3">Count</th>
                <th className="py-2.5 px-3">Severity & Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-amber-700">
                    "{row.word}"
                  </td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    {row.count}x
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600">
                    {row.count > 3
                      ? 'High frequency. Replace with deliberate 1-second pause.'
                      : 'Moderate usage. Be conscious during slide transitions.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 bg-emerald-50/50 rounded-xl border border-emerald-200">
          <p className="text-sm text-emerald-800 font-bold">
            🎉 Great job! No prominent filler words detected in your presentation speech.
          </p>
        </div>
      )}
    </Card>
  );
};
