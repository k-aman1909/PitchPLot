import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioVisualizer } from '../../hooks/useAudioVisualizer';
import { AudioVisualizer } from '../presentation/AudioVisualizer';
import { Mic, Square, Send, RefreshCw, Type, Radio, Sparkles } from 'lucide-react';

export const AnswerConsole = ({ onSubmit, isSubmitting }) => {
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text'
  const [textInput, setTextInput] = useState('');

  const {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  } = useSpeechRecognition();

  const { audioLevel } = useAudioVisualizer(isListening);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const finalAnswer = inputMode === 'voice' ? fullTranscript : textInput;
    if (finalAnswer && finalAnswer.trim().length >= 5) {
      onSubmit(finalAnswer.trim());
    }
  };

  const currentAnswerText = inputMode === 'voice' ? fullTranscript : textInput;

  return (
    <Card className="p-4 sm:p-5 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-xl space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Answer Format:</span>
        <div className="flex bg-slate-100 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setInputMode('voice')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'voice'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Voice Mic</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'text'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Text</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {inputMode === 'voice' ? (
          <div className="space-y-3">
            {/* Visualizer & Mic Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10">
              <div className="flex-1 w-full">
                <AudioVisualizer isListening={isListening} audioLevel={audioLevel} />
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {!isListening ? (
                  <Button
                    type="button"
                    onClick={startListening}
                    variant="primary"
                    size="md"
                    className="shadow-md shadow-purple-600/30"
                  >
                    <Mic className="w-4 h-4 mr-1.5" />
                    Record Voice
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={stopListening}
                    variant="danger"
                    size="md"
                    className="animate-pulse shadow-md shadow-rose-600/30"
                  >
                    <Square className="w-4 h-4 fill-current mr-1.5" />
                    Stop Mic
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={resetTranscript}
                  variant="secondary"
                  size="md"
                  className="px-3 bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  title="Clear Voice Input"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Realtime Live Speech Answer Stream */}
            <div className="p-4 bg-slate-50 dark:bg-[#0B1120]/90 rounded-2xl border border-slate-200 dark:border-white/10 min-h-[100px] max-h-[180px] overflow-y-auto">
              <span className="text-[10px] font-bold text-[#6D4AFF] dark:text-purple-400 uppercase tracking-widest block mb-1.5">
                🎙 Spoken Answer Live Transcript:
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {fullTranscript || transcript ? (
                  <>
                    <span>{fullTranscript || transcript}</span>
                    <span className="text-[#6D4AFF] dark:text-purple-400 italic font-semibold"> {interimTranscript}</span>
                  </>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    Click 'Record Voice' and speak your answer clearly...
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Type your response:
            </label>
            <textarea
              rows={3}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Provide a clear, structured answer citing relevant slide context and quantitative rationale..."
              className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* Submit Response Button */}
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={!currentAnswerText || currentAnswerText.trim().length < 5}
            className="w-full sm:w-auto"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Answer for AI Evaluation
          </Button>
        </div>
      </form>
    </Card>
  );
};
