import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ScoreGauge } from '../reports/ScoreGauge';
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Award,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

export const EvaluationResult = ({ evaluation, onNextQuestion, isLastQuestion }) => {
  if (!evaluation) return null;

  const scoreTen = evaluation.scoreTenScale || (evaluation.score ? (evaluation.score / 10).toFixed(1) : '8.2');
  const confidence = evaluation.confidenceLevel || (evaluation.score >= 80 ? 'High' : evaluation.score >= 65 ? 'Medium' : 'Low');

  return (
    <Card className="p-5 space-y-5 border-purple-500/30 bg-white dark:bg-[#0F172A] shadow-xl animate-fadeIn">
      {/* Top Evaluation Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center space-x-4">
          <ScoreGauge score={evaluation.score || 82} label="Answer Score" size="sm" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge variant={evaluation.score >= 80 ? "purple" : evaluation.score >= 65 ? "amber" : "danger"} size="md">
                Score: {scoreTen} / 10
              </Badge>

              <Badge
                variant={confidence === 'High' ? 'purple' : confidence === 'Medium' ? 'cyan' : 'amber'}
                size="sm"
                className="flex items-center"
              >
                <ShieldCheck className="w-3 h-3 mr-1" /> Confidence: {confidence}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {evaluation.feedback}
            </p>
          </div>
        </div>

        <Button
          onClick={onNextQuestion}
          variant="primary"
          size="md"
          className="shrink-0"
        >
          <span>{isLastQuestion ? 'Complete Session' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>

      {/* Points Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Covered Key Points */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" /> Key Points Hit
          </h4>
          {evaluation.keyPointsCovered && evaluation.keyPointsCovered.length > 0 ? (
            <ul className="space-y-1 text-xs text-slate-800 dark:text-slate-200">
              {evaluation.keyPointsCovered.map((pt, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-emerald-600 dark:text-emerald-400 mr-2 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">No primary key points explicitly detected.</p>
          )}
        </div>

        {/* Missing Points */}
        <div className="p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center">
            <XCircle className="w-4 h-4 mr-1.5 text-rose-600 dark:text-rose-400" /> Missing Points
          </h4>
          {evaluation.missingPoints && evaluation.missingPoints.length > 0 ? (
            <ul className="space-y-1 text-xs text-slate-800 dark:text-slate-200">
              {evaluation.missingPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-rose-600 dark:text-rose-400 mr-2 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All essential arguments addressed!</p>
          )}
        </div>
      </div>

      {/* Recommended Model Response & Expert Explanation */}
      {(evaluation.correctAnswer || evaluation.betterExplanation) && (
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/20 rounded-xl space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-[#6D4AFF] dark:text-purple-300 font-bold">
            <Sparkles className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400" />
            <span>Senior Executive Model Answer & Strategy:</span>
          </div>

          {evaluation.correctAnswer && (
            <p className="text-slate-800 dark:text-slate-300 leading-relaxed">
              <strong className="text-[#6D4AFF] dark:text-purple-300 font-semibold">Core Strategy:</strong> {evaluation.correctAnswer}
            </p>
          )}

          {evaluation.betterExplanation && (
            <p className="text-slate-800 dark:text-slate-300 leading-relaxed pt-1.5 border-t border-purple-200 dark:border-purple-500/20">
              <strong className="text-[#6D4AFF] dark:text-purple-300 font-semibold">Executive Delivery:</strong> "{evaluation.betterExplanation}"
            </p>
          )}
        </div>
      )}

      {/* Improvement Tips List */}
      {evaluation.improvementTips && evaluation.improvementTips.length > 0 && (
        <div className="p-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center">
            <Lightbulb className="w-4 h-4 mr-1.5 text-amber-600 dark:text-amber-400" /> Practical Viva Delivery Tips
          </h4>
          <ul className="space-y-1 text-slate-700 dark:text-slate-300">
            {evaluation.improvementTips.map((tip, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-[#6D4AFF] dark:text-purple-400 mr-2 font-bold">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
