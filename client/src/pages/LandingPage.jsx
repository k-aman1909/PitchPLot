import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  Mic,
  Sparkles,
  Zap,
  Award,
  TrendingUp,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
  Bot,
  Presentation,
  Play,
  Volume2,
  Clock,
  Activity,
  ChevronRight
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#070B14] text-[#F8FAFC] flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0B1120]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-white tracking-tight">SlideSense</span>
              <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest -mt-1">
                AI Pitch Intelligence
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            <a href="#preview" className="hover:text-white transition-colors">Product Preview</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#usecases" className="hover:text-white transition-colors">Use Cases</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center w-full">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-8 animate-bounce">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>✦ AI POWERED PRESENTATION PRACTICE</span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.08]">
          Present. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
            Get Challenged.
          </span> <br />
          Get Better.
        </h1>

        <p className="mt-8 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          Upload your presentation, present naturally, and let SlideSense analyze your delivery and challenge your ideas with AI-powered interview questions.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="xl" className="w-full sm:w-auto text-base">
              <Mic className="w-5 h-5 mr-2" />
              Start Practicing Free
            </Button>
          </Link>
          <a href="#preview" className="w-full sm:w-auto">
            <Button variant="secondary" size="xl" className="w-full sm:w-auto text-base bg-slate-900 border-white/10 text-slate-200 hover:bg-slate-800">
              <Play className="w-4 h-4 mr-2 fill-current" />
              Watch Demo
            </Button>
          </a>
        </div>

        {/* Product Preview Interface Display */}
        <div id="preview" className="mt-16 max-w-6xl mx-auto rounded-3xl bg-[#0B1120] border border-white/15 p-2 sm:p-4 shadow-2xl shadow-purple-900/20 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-[28px] opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />

          <div className="relative rounded-2xl bg-[#070B14] border border-white/10 overflow-hidden text-left space-y-3">
            {/* Header bar of preview */}
            <div className="bg-[#0B1120] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-300 ml-2">Q3 Business Strategy Pitch Deck.pptx</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Session
                </span>
                <span className="text-xs text-slate-400 font-mono">00:24:18</span>
              </div>
            </div>

            {/* Main Preview Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">
              {/* Thumbnails list */}
              <div className="lg:col-span-2 hidden lg:flex flex-col space-y-2 max-h-[380px] overflow-hidden opacity-80">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className={`p-2 rounded-xl border text-[11px] font-bold ${
                      num === 1 ? 'border-purple-500 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500' : 'border-white/5 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between mb-1">
                      <span>Slide {num}</span>
                    </div>
                    <div className="h-10 bg-slate-800 rounded-md border border-white/5 flex items-center justify-center text-[9px] text-slate-500">
                      {num === 1 ? 'Executive Summary' : num === 2 ? 'Market Opportunity' : num === 3 ? 'Our Solution' : 'Business Model'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Center PPT Display */}
              <div className="lg:col-span-7 bg-[#0F172A] rounded-2xl border border-white/10 p-6 flex flex-col justify-between min-h-[360px] relative overflow-hidden">
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold">
                    Executive Summary
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    Empowering businesses with intelligent automation.
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                    Our AI-powered platform streamlines operations, reduces manual work, and drives growth across enterprise teams.
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5">
                      <span className="text-[10px] text-slate-400 font-bold block">Revenue Goal</span>
                      <span className="text-sm font-extrabold text-white">$18.6M</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5">
                      <span className="text-[10px] text-slate-400 font-bold block">ROI Target</span>
                      <span className="text-sm font-extrabold text-cyan-400">3.2x</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5">
                      <span className="text-[10px] text-slate-400 font-bold block">Satisfaction</span>
                      <span className="text-sm font-extrabold text-purple-400">98%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Slide 1 of 24</span>
                  <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-1/4" />
                  </div>
                  <span>100% Zoom</span>
                </div>
              </div>

              {/* AI Interviewer Right Panel */}
              <div className="lg:col-span-3 bg-[#111827] rounded-2xl border border-purple-500/30 p-4 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Interviewer
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Question 03/20</span>
                  </div>

                  <p className="text-xs font-bold text-white leading-relaxed">
                    "Why did you choose this approach for solving the problem?"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
                    <Mic className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    <span>Listening to your answer...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1 h-6">
                    <div className="w-1 bg-purple-400 rounded-full animate-waveform-1" />
                    <div className="w-1 bg-indigo-400 rounded-full animate-waveform-2" />
                    <div className="w-1 bg-cyan-400 rounded-full animate-waveform-3" />
                    <div className="w-1 bg-purple-400 rounded-full animate-waveform-4" />
                    <div className="w-1 bg-indigo-400 rounded-full animate-waveform-5" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono text-center block">00:24</span>
                </div>

                <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Live Telemetry</span>
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>Pace: 142 WPM</span>
                    <span>Score: 82/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="purple" size="md">✦ COMPLETE PREPARATION ENGINE</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Designed for Real Interviews & High-Stakes Presentations
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            From technical viva defense to investor pitch decks, SlideSense challenges your core assumptions so you never freeze under pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 border-white/10 hover:border-purple-500/40">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit">
              <Presentation className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Actual Slide Rendering</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload your PPT, PPTX, or PDF. SlideSense displays your exact visual slide layout while analyzing speech in real time.
            </p>
          </Card>

          <Card className="p-6 space-y-4 border-white/10 hover:border-purple-500/40">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Intelligent AI Interviewer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generates non-generic, presentation-grounded questions testing your understanding, decision trade-offs, and critical reasoning.
            </p>
          </Card>

          <Card className="p-6 space-y-4 border-white/10 hover:border-purple-500/40">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Live Telemetry & Final Report</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track WPM pace, filler words, clarity scores, and receive actionable feedback reports after every practice session.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white">SlideSense AI</span>
            <span>— Present. Get Challenged. Get Better.</span>
          </div>
          <span>© 2026 SlideSense AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
