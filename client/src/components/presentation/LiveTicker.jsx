import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AudioVisualizer } from './AudioVisualizer';
import { useAudioVisualizer } from '../../hooks/useAudioVisualizer';
import {
  Mic,
  Square,
  RefreshCw,
  Clock,
  Zap,
  AlertCircle,
  MessageSquarePlus,
  Play,
  HelpCircle
} from 'lucide-react';

export const LiveTicker = ({
  isListening,
  transcript,
  interimTranscript,
  fullTranscript,
  wpm,
  duration,
  fillerStats,
  onStart,
  onStop,
  onReset,
  onAppendText,
  onSubmitForAnalysis,
  onDirectQA,
  isAnalyzing
}) => {
  const [manualInput, setManualInput] = useState('');
  const { audioLevel } = useAudioVisualizer(isListening);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddManualText = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onAppendText(manualInput.trim());
      setManualInput('');
    }
  };

  const renderHighlightedTranscript = (text) => {
    if (!text) return 'Microphone active. Start speaking your presentation...';

    const fillers = ['um', 'uh', 'ah', 'like', 'you know', 'basically', 'so', 'actually', 'honestly', 'literally'];
    const regex = new RegExp(`\\b(${fillers.join('|')})\\b`, 'gi');

    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (fillers.includes(part.toLowerCase())) {
        return (
          <span
            key={i}
            className="bg-amber-100 text-amber-800 font-bold px-1 rounded border border-amber-300"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Real-time Performance Metrics Bar */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-white border-slate-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Duration</span>
            <span className="text-base font-extrabold text-slate-900">{formatDuration(duration)}</span>
          </div>
        </Card>

        <Card className="p-3 bg-white border-slate-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Live Pacing</span>
            <span className="text-base font-extrabold text-slate-900">{wpm} WPM</span>
          </div>
        </Card>

        <Card className="p-3 bg-white border-slate-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Fillers</span>
            <span className="text-base font-extrabold text-slate-900">{fillerStats?.count || 0} words</span>
          </div>
        </Card>
      </div>

      {/* Real-Time Audio Visualizer & Waveform Bar */}
      <Card className="p-4 bg-white border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          <span className="text-xs font-bold text-slate-700">
            {isListening ? 'Mic Active — Listening to Pitch' : 'Microphone Inactive'}
          </span>
        </div>

        <div className="w-32 h-6">
          <AudioVisualizer isListening={isListening} audioLevel={audioLevel} />
        </div>
      </Card>

      {/* Live Speech Stream Console */}
      <Card className="flex-1 min-h-[260px] p-5 flex flex-col justify-between bg-white border-slate-200 shadow-sm">
        <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-purple-700 uppercase tracking-wider">
              Live Speech Stream
            </span>
            <Badge variant={isListening ? "emerald" : "gray"} size="sm">
              {isListening ? "Recording" : "Ready"}
            </Badge>
          </div>

          <p className="text-sm leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
            {renderHighlightedTranscript(fullTranscript || transcript)}
            <span className="text-purple-600 italic"> {interimTranscript}</span>
          </p>
        </div>

        {/* Manual Speech/Transcript Injection Input */}
        <form onSubmit={handleAddManualText} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type pitch text or paste transcript here..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button type="submit" variant="secondary" size="sm">
            <MessageSquarePlus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </form>
      </Card>

      {/* Action Controls Toolbar */}
      <div className="flex items-center gap-3">
        {isListening ? (
          <Button
            onClick={onStop}
            variant="danger"
            size="lg"
            className="flex-1"
          >
            <Square className="w-4 h-4 fill-current mr-2" />
            Pause Pitch
          </Button>
        ) : (
          <Button
            onClick={onStart}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            <Mic className="w-4 h-4 mr-2" />
            Start Pitch Recording
          </Button>
        )}

        <Button
          onClick={onReset}
          variant="secondary"
          size="lg"
          className="px-3"
          title="Reset transcript"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </Button>
      </div>
    </div>
  );
};
