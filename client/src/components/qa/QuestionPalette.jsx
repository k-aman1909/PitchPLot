import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CheckCircle2, XCircle, Clock, Flag, Award, AlertCircle } from 'lucide-react';

export const QuestionPalette = ({
  questions,
  currentIndex,
  evaluations,
  skippedQuestions,
  onSelectQuestion,
  onEndTest
}) => {
  if (!questions || questions.length === 0) return null;

  const totalQuestions = questions.length;
  const attemptedCount = Object.keys(evaluations).length;
  const skippedCount = Object.keys(skippedQuestions).filter(idx => !evaluations[idx]).length;
  const unattemptedCount = totalQuestions - attemptedCount - skippedCount;

  const totalPossibleMarks = totalQuestions * 2;
  let totalMarksObtained = 0;

  Object.values(evaluations).forEach(ev => {
    const score = ev.score || 80;
    const questionMarks = (score / 100) * 2;
    totalMarksObtained += questionMarks;
  });

  return (
    <Card className="p-5 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-xl space-y-5">
      {/* Palette Header */}
      <div className="pb-3 border-b border-slate-200 dark:border-white/10 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center">
            <Award className="w-4 h-4 mr-1.5 text-[#6D4AFF] dark:text-purple-400" /> Question Palette
          </h3>
          <Badge variant="purple" size="sm">
            2 Marks Each
          </Badge>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Total Test Weightage: <strong className="text-[#6D4AFF] dark:text-purple-300 font-bold">{totalPossibleMarks} Marks</strong> ({totalQuestions} Questions)
        </p>
      </div>

      {/* Status Legend Bar */}
      <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold">
        <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          <span>Attempted ({attemptedCount})</span>
        </div>
        <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 dark:bg-rose-400" />
          <span>Skipped ({skippedCount})</span>
        </div>
        <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
          <span>Pending ({unattemptedCount})</span>
        </div>
      </div>

      {/* Grid of Clickable Question Number Pills */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Select Question Number to Jump / Reattempt:
        </span>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAttempted = !!evaluations[idx];
            const isSkipped = !!skippedQuestions[idx] && !isAttempted;

            let btnClasses = "h-10 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center relative border shadow-sm ";

            if (isCurrent) {
              btnClasses += "ring-2 ring-purple-400 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 scale-105 z-10 shadow-lg shadow-purple-600/40 ";
            } else if (isAttempted) {
              btnClasses += "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 ";
            } else if (isSkipped) {
              btnClasses += "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/25 ";
            } else {
              btnClasses += "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white ";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                className={btnClasses}
                title={`Question ${idx + 1}: ${isAttempted ? 'Attempted' : isSkipped ? 'Skipped' : 'Unattempted'}`}
              >
                <span>{idx + 1}</span>
                {isAttempted && (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold leading-none">
                    {((evaluations[idx].score / 100) * 2).toFixed(1)}m
                  </span>
                )}
                {isSkipped && (
                  <span className="text-[9px] text-rose-600 dark:text-rose-400 font-bold leading-none">
                    Skip
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Cumulative Marks Gauge */}
      <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/20 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block uppercase">Current Marks Secured:</span>
          <span className="text-xl font-black text-[#6D4AFF] dark:text-purple-300">
            {totalMarksObtained.toFixed(1)} / {totalPossibleMarks}
          </span>
        </div>
        <span className="text-xs font-bold text-[#6D4AFF] dark:text-purple-400">
          {((totalMarksObtained / totalPossibleMarks) * 100).toFixed(0)}%
        </span>
      </div>

      {/* End Test Button */}
      <Button
        type="button"
        variant="danger"
        size="md"
        onClick={onEndTest}
        className="w-full"
      >
        <Flag className="w-4 h-4 mr-1.5" />
        Submit & End Viva Exam
      </Button>
    </Card>
  );
};
