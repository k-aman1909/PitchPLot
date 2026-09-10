import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { MetricImprovementTooltip } from './MetricImprovementTooltip';
import {
  FileText,
  Award,
  MessageCircle,
  Activity,
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';

export const MetricsGrid = ({ scores = {} }) => {
  const items = [
    { key: 'contentQuality', label: 'Content Quality', icon: FileText, score: scores.contentQuality || 85 },
    { key: 'confidence', label: 'Confidence & Delivery', icon: Award, score: scores.confidence || 82 },
    { key: 'communication', label: 'Communication Clarity', icon: MessageCircle, score: scores.communication || 86 },
    { key: 'fluency', label: 'Vocal Fluency', icon: Activity, score: scores.fluency || 80 },
    { key: 'grammar', label: 'Grammar & Structure', icon: CheckCircle2, score: scores.grammar || 90 },
    { key: 'presentationFlow', label: 'Slide Flow & Logic', icon: TrendingUp, score: scores.presentationFlow || 84 },
    { key: 'timeManagement', label: 'Time Management', icon: Clock, score: scores.timeManagement || 88 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        let color = 'brand';
        if (item.score >= 85) color = 'emerald';
        else if (item.score >= 70) color = 'cyan';
        else color = 'amber';

        return (
          <MetricImprovementTooltip
            key={item.key}
            metricKey={item.key}
            metricName={item.label.toUpperCase()}
            rawValue={item.score}
            displayValue={`${item.score} / 100`}
          >
            <Card className="p-4 flex flex-col justify-between bg-white border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:border-purple-200 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                    {item.label}
                  </span>
                </div>
                <span className="text-base font-extrabold text-slate-900">{item.score}</span>
              </div>
              <ProgressBar progress={item.score} color={color} height="h-2" />
            </Card>
          </MetricImprovementTooltip>
        );
      })}
    </div>
  );
};
