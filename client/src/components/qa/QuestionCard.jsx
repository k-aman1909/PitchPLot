import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  HelpCircle,
  Lightbulb,
  Layers,
  ChevronDown,
  ChevronUp,
  UserCheck,
  SkipForward,
  Mic,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const cleanQuestionText = (text) => {
  if (!text) return '';
  let cleaned = text
    .replace(/^Analyzing Slide \d+ concept '[^']+'\.\.\./i, '')
    .replace(/^Regarding concept '[^']+'\.\.\./i, '')
    .replace(/^Based on the concept '[^']+'\.\.\./i, '')
    .trim();
  return cleaned || text;
};

export const QuestionCard = ({
  question,
  index,
  totalQuestions,
  onSkipQuestion,
  onPrevQuestion,
  onNextQuestion,
  hasPrevious,
  hasNext
}) => {
  const [showHint, setShowHint] = useState(false);

  if (!question) return null;

  const persona = question.interviewerPersona || 'Presentation Judge';
  const displayQuestion = cleanQuestionText(question.questionText);

  return (
    <Card className="p-5 sm:p-6 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-xl space-y-4">
      {/* Top Bar with Persona Badges & Bi-Directional Nav Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center space-x-2">
          <Badge variant="purple" size="sm">
            <UserCheck className="w-3.5 h-3.5 mr-1 text-[#6D4AFF] dark:text-purple-400" />
            {persona}
          </Badge>
          <Badge variant="amber" size="sm">
            {question.difficulty || 'Medium'} Challenge
          </Badge>
          {question.category && (
            <Badge variant="emerald" size="sm">
              {question.category}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasPrevious && onPrevQuestion && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onPrevQuestion}
              className="text-xs bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              title="Return to Previous Question"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Prev Q{index}
            </Button>
          )}

          {hasNext && onNextQuestion && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onNextQuestion}
              className="text-xs bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              title="Go to Next Question"
            >
              Next Q{index + 2}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}

          {onSkipQuestion && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onSkipQuestion}
              className="text-xs bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
              title="Skip this question"
            >
              <SkipForward className="w-3.5 h-3.5 mr-1" />
              Skip
            </Button>
          )}
        </div>
      </div>

      {/* Question Header & Body */}
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-[#6D4AFF] dark:text-purple-400 shrink-0 shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#6D4AFF] dark:text-purple-400 uppercase tracking-widest">
              Question {index + 1} of {totalQuestions}
            </span>
            {question.slideNumber && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center">
                <Layers className="w-3 h-3 mr-1 text-slate-500" />
                Targeting Slide #{question.slideNumber}
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
            "{displayQuestion}"
          </h2>
        </div>
      </div>

      {/* Accordion Hint & Guidance Area */}
      <div className="pt-2 border-t border-slate-200 dark:border-white/10">
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="flex items-center justify-between w-full text-xs font-bold text-[#6D4AFF] dark:text-purple-400 hover:underline transition-colors py-1"
        >
          <div className="flex items-center space-x-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Need Guidance on How to Answer?</span>
          </div>
          {showHint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHint && (
          <div className="mt-3 p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl space-y-2 text-xs text-amber-900 dark:text-amber-200 animate-fadeIn">
            <p className="font-medium">
              💡 <strong>Strategy:</strong> {question.idealAnswerHint || 'Address the quantitative metrics and strategic rationale mentioned on this slide.'}
            </p>
            {question.expectedKeyPoints && question.expectedKeyPoints.length > 0 && (
              <div>
                <span className="font-bold block mb-1">Key concepts to highlight:</span>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300">
                  {question.expectedKeyPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
