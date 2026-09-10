import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { usePresentation } from '../context/PresentationContext';
import {
  Target,
  Sparkles,
  BrainCircuit,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

export const PracticePage = () => {
  const navigate = useNavigate();
  const { activePresentation } = usePresentation();
  const [selectedFocus, setSelectedFocus] = useState('Critical Thinking');

  const weakAreas = [
    {
      title: 'Critical Thinking Under Pressure',
      score: 61,
      tag: 'High Priority',
      description: 'Defending why you chose a specific solution and evaluating trade-offs when questioned by panelists.',
      questionsCount: '12 Targeted Prompts',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30'
    },
    {
      title: 'Answer Depth & Technical Justification',
      score: 68,
      tag: 'Recommended',
      description: 'Elaborating beyond surface-level bullet points and backing claims with concrete evidence.',
      questionsCount: '15 Targeted Prompts',
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30'
    },
    {
      title: 'Handling Unexpected Edge Cases',
      score: 72,
      tag: 'Practice Area',
      description: 'Responding confidently when asked about failure modes, scalability limits, or real-world implementation constraints.',
      questionsCount: '10 Targeted Prompts',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30'
    }
  ];

  const handleStartPractice = (focusArea) => {
    setSelectedFocus(focusArea);
    navigate('/qa-round');
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
        {/* Header */}
        <div className="pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Target className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Targeted Practice Studio
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Strengthen specific presentation vulnerabilities with custom AI interview simulations.
            </p>
          </div>

          <Badge variant="purple" size="md">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" /> Active Deck: {activePresentation?.title || 'Q3 Pitch Deck'}
          </Badge>
        </div>

        {/* Practice Banner */}
        <Card className="p-6 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#0B1120] border-purple-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-3 relative z-10">
            <Badge variant="purple" size="sm">✦ TARGETED INTERVIEW DRILLS</Badge>
            <h2 className="text-2xl font-extrabold text-white leading-tight">
              Focus your practice on the exact questions that challenged you most.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              SlideSense tracks your previous answer depth and critical reasoning scores to construct targeted viva drills.
            </p>
          </div>
        </Card>

        {/* Weak Areas Cards Grid */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Recommended Focus Areas Based on Recent Sessions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weakAreas.map((area, idx) => (
              <Card key={idx} className={`p-6 flex flex-col justify-between space-y-4 bg-gradient-to-b ${area.color} border transition-all hover:scale-[1.01]`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{area.tag}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-amber-400 font-extrabold text-xs border border-white/10">
                      Score: {area.score}%
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white leading-snug">{area.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{area.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">{area.questionsCount}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartPractice(area.title)}
                  >
                    <span>Practice Drill</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Focus Mode Launcher */}
        <Card className="p-6 border-white/10 space-y-4 bg-[#0B1120]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400" /> Launch Custom Persona Interview
            </h3>
            <span className="text-xs text-slate-400">Select interviewer persona for targeted simulation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Executive Board Member', desc: 'Challenges ROI, business risk, and strategic vision.', icon: Shield },
              { title: 'Technical Lead Architect', desc: 'Drills deep into code design, scalability, and algorithms.', icon: BrainCircuit },
              { title: 'Academic Viva Panelist', desc: 'Questions methodologies, literature groundings, and thesis claims.', icon: Target },
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleStartPractice(p.title)}
                  className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-purple-500/50 hover:bg-slate-900 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-white">{p.title}</span>
                  </div>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
};
