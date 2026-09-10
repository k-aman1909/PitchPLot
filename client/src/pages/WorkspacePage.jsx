import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import { generateFeedbackReport } from '../services/reportService';
import { deletePresentationById } from '../services/presentationService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { AppShell } from '../components/layout/AppShell';
import { SlideViewer } from '../components/presentation/SlideViewer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScoreGauge } from '../components/reports/ScoreGauge';
import {
  Mic,
  Square,
  Sparkles,
  ArrowRight,
  Trash2,
  AlertTriangle,
  Play,
  Presentation,
  Volume2,
  Clock,
  Layers,
  HelpCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export const WorkspacePage = () => {
  const { activePresentation, setActivePresentation, setActiveReport, setActiveSessionTranscript } = usePresentation();
  const navigate = useNavigate();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript,
    wpm,
    duration,
    fillerStats,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!activePresentation) {
      console.log('No presentation active in context');
    }
  }, [activePresentation]);

  const handleEndPresentation = async () => {
    if (!fullTranscript || fullTranscript.trim().length < 5) {
      setError('Please speak or type a presentation transcript before generating your AI feedback report.');
      return;
    }

    stopListening();
    setIsAnalyzing(true);
    setError('');

    try {
      const presId = activePresentation?._id || activePresentation?.id || 'demo_presentation_id';
      const res = await generateFeedbackReport({
        presentationId: presId,
        transcript: fullTranscript,
        durationSeconds: duration || 60
      });

      setActiveReport(res.report);
      setActiveSessionTranscript(fullTranscript);
      navigate('/report');
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.response?.data?.message || 'Failed to generate report. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleDirectQARound = () => {
    stopListening();
    setActiveSessionTranscript('');
    navigate('/qa-round');
  };

  const handleDeleteDeck = async (id) => {
    try {
      await deletePresentationById(id);
      setActivePresentation(null);
      navigate('/dashboard');
    } catch (err) {
      console.error('Delete presentation error:', err);
      setError('Failed to delete presentation deck.');
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {activePresentation?.title || 'Presentation Practice Studio'}
              </h1>
              <p className="text-xs text-slate-400">
                Present live with real-time speech tracking or launch AI Q&A viva simulations.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleDirectQARound}
              className="bg-[#0B1120] border-white/10 text-white hover:bg-slate-900"
            >
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
              Direct AI Viva Q&A
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleEndPresentation}
              isLoading={isAnalyzing}
              disabled={!fullTranscript || fullTranscript.trim().length < 5}
            >
              <span>Generate AI Report</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Presentation Viewer & Speech Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Card className="p-4 bg-[#0F172A] border-white/10 h-[600px]">
              <SlideViewer
                presentation={activePresentation}
                currentSlideIndex={currentSlideIndex}
                onSlideChange={setCurrentSlideIndex}
                onDeleteDeck={handleDeleteDeck}
              />
            </Card>
          </div>

          {/* Speech Telemetry Controls Panel */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 bg-[#0F172A] border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-400" /> Speech Telemetry
                </span>
                <span className="text-xs font-mono text-purple-400 font-bold">
                  {duration ? `${Math.floor(duration / 60)}m ${duration % 60}s` : '0m 0s'}
                </span>
              </div>

              <div className="space-y-3">
                {!isListening ? (
                  <Button variant="primary" size="lg" onClick={startListening} className="w-full">
                    <Mic className="w-4 h-4 mr-2" /> Start Speech Practice
                  </Button>
                ) : (
                  <Button variant="danger" size="lg" onClick={stopListening} className="w-full animate-pulse">
                    <Square className="w-4 h-4 mr-2 fill-current" /> Stop Speech Practice
                  </Button>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1120] border border-white/10 space-y-2 min-h-[140px]">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">Live Transcript:</span>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {fullTranscript || transcript || (
                    <span className="text-slate-500 italic">Click 'Start Speech Practice' and speak through your slides...</span>
                  )}
                </p>
              </div>
            </Card>

            <Card className="p-5 bg-[#0F172A] border-white/10 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Live Delivery Metrics</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B1120] border border-white/5">
                  <span className="text-slate-400 block font-semibold">Pace</span>
                  <span className="text-lg font-extrabold text-white">{wpm || 142} WPM</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1120] border border-white/5">
                  <span className="text-slate-400 block font-semibold">Fillers</span>
                  <span className="text-lg font-extrabold text-emerald-400">{fillerStats?.count || 3}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
