import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { usePresentation } from '../context/PresentationContext';
import { generateQuestions } from '../services/qaService';
import { AppShell } from '../components/layout/AppShell';
import { ScoreGauge } from '../components/reports/ScoreGauge';
import { MetricImprovementTooltip } from '../components/reports/MetricImprovementTooltip';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FILLER_WORDS_LIST } from '../utils/fillerWords';
import {
  Award,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Target,
  BrainCircuit,
  TrendingUp,
  Clock,
  Mic,
  ShieldCheck
} from 'lucide-react';

export const ReportPage = () => {
  const { activeReport, activePresentation } = usePresentation();
  const navigate = useNavigate();
  const [loadingQA, setLoadingQA] = useState(false);

  const report = activeReport || getFallbackReport();

  useEffect(() => {
    if (report && (report.overallScore || 82) >= 80) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [report]);

  const handleStartQARound = async () => {
    setLoadingQA(true);
    try {
      const presId = report.presentationId || activePresentation?._id || 'demo_presentation_id';
      const repId = report._id || report.id || '';
      await generateQuestions(presId, repId);
      navigate('/qa-round');
    } catch (err) {
      console.warn('Q&A generation fallback:', err.message);
      navigate('/qa-round');
    } finally {
      setLoadingQA(false);
    }
  };

  const skillDimensions = [
    { name: 'Presentation Understanding', score: 88, status: 'Strong' },
    { name: 'Communication & Clarity', score: 79, status: 'Good' },
    { name: 'Critical Thinking Under Pressure', score: 76, status: 'Focus Area' },
    { name: 'Answer Quality & Structure', score: 84, status: 'Strong' },
    { name: 'Delivery Confidence', score: 81, status: 'Good' },
  ];

  const whatYouDidWell = report.strengths || [
    "Strong problem explanation with clear value proposition",
    "Good technical understanding of core product mechanics",
    "Clear explanation of your solution and unit economics"
  ];

  const areasToImprove = report.improvements || [
    "Answer depth when defending architectural decisions",
    "Defending technical choices against alternative approaches",
    "Explaining system limitations and failure modes"
  ];

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 w-full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <Badge variant="purple" size="sm" className="mb-1">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Presentation Report
            </Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {report.presentationTitle || 'Q3 Business Strategy Pitch Deck Report'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/workspace')}
              className="bg-[#0B1120] border-white/10 text-white hover:bg-slate-900"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" /> Re-practice Deck
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleStartQARound}
              isLoading={loadingQA}
            >
              <Sparkles className="w-4 h-4 mr-1.5" /> Start AI Interview Viva
            </Button>
          </div>
        </div>

        {/* Top Report Overall Performance Banner */}
        <Card className="p-8 bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-[#0B1120] border-purple-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ScoreGauge score={report.overallScore || 82} label="" size="lg" />
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest block">
                  YOUR PRESENTATION REPORT
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {report.overallScore >= 85 ? 'Outstanding Performance!' : report.overallScore >= 75 ? 'Excellent Performance!' : 'Good Effort'}
                </h2>
                <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
                  {report.summary || 'Your presentation delivery was confident with strong slide comprehension. Practice defending trade-off rationale to maximize viva score.'}
                </p>
              </div>
            </div>

            <div className="space-y-2 shrink-0">
              <Link to="/practice">
                <Button variant="primary" size="lg" className="shadow-lg shadow-purple-600/30">
                  <Target className="w-4 h-4 mr-2" /> Practice Weak Areas
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Skill Dimensions Breakdown Grid */}
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" /> Skill Dimensions Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {skillDimensions.map((dim, idx) => (
              <Card key={idx} className="p-4 space-y-3 border-white/10 bg-[#0F172A] hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dim.status}</span>
                  <Badge variant="purple" size="sm">{dim.score}%</Badge>
                </div>
                <span className="text-xs font-bold text-white block h-8 line-clamp-2">{dim.name}</span>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${dim.score}%` }} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* What You Did Well & Areas to Improve Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What You Did Well */}
          <Card className="p-6 space-y-4 border-emerald-500/30 bg-[#0F172A]">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-white">WHAT YOU DID WELL</h3>
            </div>

            <ul className="space-y-3">
              {whatYouDidWell.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Areas to Improve */}
          <Card className="p-6 space-y-4 border-amber-500/30 bg-[#0F172A]">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-white">AREAS TO IMPROVE</h3>
            </div>

            <ul className="space-y-3">
              {areasToImprove.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* AI Recommendation Banner */}
        <Card className="p-6 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-[#0B1120] border-purple-500/40 space-y-3">
          <div className="flex items-center space-x-2 text-purple-300 font-bold text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>AI RECOMMENDATION</span>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-white leading-relaxed">
            "Before your next interview, practice defending your architectural decisions and explaining the trade-offs behind them."
          </p>
          <div className="pt-2">
            <Link to="/practice">
              <Button variant="primary" size="md">
                <Target className="w-4 h-4 mr-2" /> Practice Weak Areas Now
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};

function getFallbackReport() {
  return {
    presentationTitle: 'Q3 Business Strategy Pitch Deck',
    overallScore: 82,
    summary: 'Your presentation delivery was structured with clear slide comprehension. Focus on strengthening trade-off rationale.',
    strengths: [
      'Strong problem explanation with quantitative rationale',
      'Good technical understanding of core product architecture',
      'Clear explanation of solution and CAC metrics'
    ],
    improvements: [
      'Answer depth when defending architectural decisions',
      'Defending technical choices against alternative approaches',
      'Explaining system limitations and failure modes'
    ]
  };
}
