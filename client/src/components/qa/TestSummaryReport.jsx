import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ScoreGauge } from '../reports/ScoreGauge';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  PlusCircle,
  BrainCircuit,
  TrendingUp,
  Target,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const TestSummaryReport = ({
  questions,
  evaluations,
  skippedQuestions,
  roundNumber,
  onGenerateMore,
  onRetake,
  onDashboard,
  isGeneratingMore
}) => {
  const totalQuestions = questions.length;
  const totalPossibleMarks = totalQuestions * 2;

  let totalMarksObtained = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  questions.forEach((q, idx) => {
    const ev = evaluations[idx];
    if (ev) {
      const qMarks = ((ev.score || 80) / 100) * 2;
      totalMarksObtained += qMarks;
      if (ev.score >= 70) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
  });

  const skippedCount = Object.keys(skippedQuestions).filter(idx => !evaluations[idx]).length;
  const percentage = Math.round((totalMarksObtained / totalPossibleMarks) * 100);

  const getPerformanceBadge = (pct) => {
    if (pct >= 90) return { label: 'Outstanding (Mastery)', color: 'purple' };
    if (pct >= 75) return { label: 'Very Good', color: 'cyan' };
    if (pct >= 60) return { label: 'Good (Pass)', color: 'warning' };
    return { label: 'Needs Improvement', color: 'danger' };
  };

  const perf = getPerformanceBadge(percentage);

  // Group Strong vs Weak Topics
  const topicScores = {};
  questions.forEach((q, idx) => {
    const cat = q.category || 'General Strategy';
    if (!topicScores[cat]) topicScores[cat] = { total: 0, count: 0 };

    const ev = evaluations[idx];
    if (ev) {
      topicScores[cat].total += ev.score || 80;
      topicScores[cat].count += 1;
    } else {
      topicScores[cat].total += 0;
      topicScores[cat].count += 1;
    }
  });

  const strongTopics = [];
  const weakTopics = [];

  Object.entries(topicScores).forEach(([cat, data]) => {
    const avg = data.count > 0 ? data.total / data.count : 0;
    if (avg >= 75) {
      strongTopics.push(cat);
    } else {
      weakTopics.push(cat);
    }
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner & Exam Grade */}
      <Card className="p-8 text-center space-y-6 bg-gradient-to-b from-purple-100 via-purple-50 to-white dark:from-[#16122B] dark:via-[#110E24] dark:to-[#070913] border-purple-200 dark:border-purple-500/40 shadow-2xl">
        <div className="inline-flex p-4 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-pink-400 mb-2 shadow-lg">
          <Award className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <Badge variant={perf.color} size="md" className="uppercase font-bold tracking-wider">
            Performance Level: {perf.label}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Official Presentation Viva Exam Summary
          </h2>
          <p className="text-sm text-slate-600 dark:text-gray-300 max-w-md mx-auto">
            Evaluation report for Round {roundNumber} containing {totalQuestions} slide-grounded interview prompts (2 Marks Each).
          </p>
        </div>

        {/* Score & Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121020] border border-slate-200 dark:border-[#231F3D]">
            <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider block">Final Marks</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalMarksObtained.toFixed(1)} / {totalPossibleMarks}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#121020] border border-slate-200 dark:border-[#231F3D]">
            <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider block">Percentage</span>
            <span className="text-2xl font-black text-[#6D4AFF] dark:text-pink-400 font-mono">{percentage}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#121020] border border-slate-200 dark:border-[#231F3D]">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">Correct Answers</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{correctCount} / {totalQuestions}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#121020] border border-slate-200 dark:border-[#231F3D]">
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block">Skipped / Incorrect</span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{skippedCount + incorrectCount} / {totalQuestions}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-purple-200 dark:border-[#231F3D]">
          <Button
            onClick={onGenerateMore}
            variant="accent"
            size="lg"
            isLoading={isGeneratingMore}
          >
            <PlusCircle className="w-5 h-5" />
            Generate Round {roundNumber + 1} Questions (+20)
          </Button>

          <Button
            onClick={onRetake}
            variant="secondary"
            size="lg"
          >
            <RotateCcw className="w-4 h-4" />
            Re-take Round {roundNumber}
          </Button>

          <Button
            onClick={onDashboard}
            variant="primary"
            size="lg"
          >
            <LayoutDashboard className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </div>
      </Card>

      {/* Strong vs Weak Topics Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <Card className="p-6 bg-white dark:bg-[#121020] border-emerald-500/30 space-y-4">
          <h3 className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2" /> Strong Mastered Topics
          </h3>
          {strongTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {strongTopics.map((topic, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold">
                  ✓ {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-gray-400 italic">Complete more questions to establish strong topic mastery.</p>
          )}
        </Card>

        {/* Weak Topics to Revise */}
        <Card className="p-6 bg-white dark:bg-[#121020] border-rose-500/30 space-y-4">
          <h3 className="text-base font-extrabold text-rose-700 dark:text-rose-400 flex items-center">
            <Target className="w-5 h-5 mr-2" /> Recommended Topics to Revise
          </h3>
          {weakTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((topic, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 text-xs font-semibold">
                  ⚠ {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All tested presentation domains scored above threshold!</p>
          )}
        </Card>
      </div>

      {/* Detailed Question-by-Question Review Breakdown */}
      <Card className="p-6 bg-white dark:bg-[#121020] border-slate-200 dark:border-[#231F3D] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#231F3D]">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-[#6D4AFF] dark:text-pink-400" /> Detailed Question-by-Question Exam Breakdown
          </h3>
          <span className="text-xs text-slate-500 dark:text-gray-400">{questions.length} Total Prompts Evaluated</span>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ev = evaluations[idx];
            const isSkipped = !ev;
            const qMarks = ev ? ((ev.score || 80) / 100) * 2 : 0;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-colors space-y-2 ${
                  ev && ev.score >= 70
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-500/20'
                    : isSkipped
                    ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-500/20'
                    : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-500/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#070913] text-[#6D4AFF] dark:text-purple-300 border border-slate-200 dark:border-[#231F3D]">
                      Q{idx + 1}
                    </span>
                    <Badge variant={ev && ev.score >= 70 ? "emerald" : isSkipped ? "danger" : "warning"} size="sm">
                      {isSkipped ? 'Skipped' : `${ev.score}% Accuracy`}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold">{q.category || 'General'}</span>
                  </div>

                  <span className="text-xs font-bold font-mono text-[#6D4AFF] dark:text-purple-300">
                    Marks: {qMarks.toFixed(1)} / 2.0
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  "{q.questionText}"
                </p>

                {ev ? (
                  <div className="text-xs space-y-1 pt-1 border-t border-slate-200 dark:border-[#231F3D]">
                    <p className="text-emerald-700 dark:text-emerald-300">
                      <strong>Model Correct Answer:</strong> {ev.correctAnswer || ev.modelAnswer}
                    </p>
                    {ev.missingPoints && ev.missingPoints.length > 0 && (
                      <p className="text-rose-700 dark:text-rose-300">
                        <strong>Missing Points:</strong> {ev.missingPoints.join(', ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-rose-700 dark:text-rose-300 italic pt-1 border-t border-slate-200 dark:border-[#231F3D]">
                    Skipped question. <strong>Ideal Answer Hint:</strong> {q.idealAnswerHint || 'Focus on slide facts and metrics.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
