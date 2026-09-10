import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Award,
  Mic,
  Clock,
  Target,
  BrainCircuit,
  Sparkles,
  ChevronRight,
  Filter,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const metrics = [
    { name: 'Overall Score', value: '82%', trend: '+6%', status: 'Optimal', color: 'from-purple-500 to-indigo-500' },
    { name: 'Speaking Pace', value: '142 WPM', trend: 'Optimal', status: 'Good Pace', color: 'from-blue-500 to-cyan-500' },
    { name: 'Confidence', value: '78%', trend: '+12%', status: 'Improving', color: 'from-[#8B5CF6] to-[#6366F1]' },
    { name: 'Clarity Score', value: '87%', trend: '+4%', status: 'High', color: 'from-emerald-500 to-teal-500' },
    { name: 'Filler Words', value: '3.2 / min', trend: '-2.1', status: 'Low', color: 'from-[#06B6D4] to-blue-500' },
    { name: 'Answer Quality', value: '84%', trend: '+8%', status: 'Strong', color: 'from-purple-500 to-pink-500' },
    { name: 'Critical Thinking', value: '76%', trend: '+14%', status: 'Target Focus', color: 'from-amber-500 to-orange-500' },
  ];

  const recentSessions = [
    { title: 'AI Product Strategy Pitch', date: '2 hours ago', score: 86, wpm: 144, fillers: 2, clarity: 90 },
    { title: 'Engineering System Architecture', date: 'Yesterday', score: 79, wpm: 138, fillers: 4, clarity: 84 },
    { title: 'Series A Investor Deck', date: '3 days ago', score: 84, wpm: 145, fillers: 3, clarity: 88 },
    { title: 'Q3 Business Growth Strategy', date: '1 week ago', score: 76, wpm: 152, fillers: 5, clarity: 80 },
  ];

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Presentation Analytics & Telemetry
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Deep AI breakdown of your speech delivery, answer depth, and interview readiness over time.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#0B1120] p-1.5 rounded-xl border border-white/10">
            {['7d', '30d', '90d', 'All'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {metrics.map((m, idx) => (
            <Card key={idx} className="p-4 space-y-3 relative overflow-hidden group border-white/10 hover:border-purple-500/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.name}</span>
                <Badge variant="purple" size="sm">{m.trend}</Badge>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{m.value}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${m.color} rounded-full`} style={{ width: '82%' }} />
              </div>
            </Card>
          ))}
        </div>

        {/* Performance Chart & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-4 border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" /> Overall Performance Trend
                </h3>
                <p className="text-xs text-slate-400">Score improvement across last 10 presentation sessions</p>
              </div>
              <Badge variant="purple" size="sm">+14% Growth</Badge>
            </div>

            {/* Visual SVG Sparkline Chart */}
            <div className="h-64 w-full bg-[#0B1120]/80 rounded-2xl p-4 border border-white/5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient opacity-40 pointer-events-none" />
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 110 Q 60 90 120 95 T 240 60 T 360 40 T 500 20 L 500 150 L 0 150 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M 0 110 Q 60 90 120 95 T 240 60 T 360 40 T 500 20"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Data Points */}
                <circle cx="120" cy="95" r="4" fill="#6366F1" className="animate-pulse" />
                <circle cx="240" cy="60" r="4" fill="#8B5CF6" className="animate-pulse" />
                <circle cx="360" cy="40" r="4" fill="#3B82F6" className="animate-pulse" />
                <circle cx="500" cy="20" r="5" fill="#06B6D4" className="animate-ping" />
              </svg>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5 font-semibold">
                <span>Session 1</span>
                <span>Session 3</span>
                <span>Session 6</span>
                <span>Session 9</span>
                <span>Latest Session</span>
              </div>
            </div>
          </Card>

          {/* Skill Radar / Strengths & Weaknesses */}
          <Card className="p-6 space-y-4 border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400" /> Skill Dimensions Breakdown
            </h3>

            <div className="space-y-3.5">
              {[
                { name: 'Technical Understanding', score: 88, label: 'Strong' },
                { name: 'Answer Depth & Structure', score: 76, label: 'Needs Focus' },
                { name: 'Critical Thinking Under Pressure', score: 72, label: 'Target Area' },
                { name: 'Speaking Pace & Rhythm', score: 92, label: 'Optimal' },
                { name: 'Filler Word Control', score: 84, label: 'Good' },
              ].map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{s.name}</span>
                    <span className="font-bold text-purple-400">{s.score}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.score >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : s.score >= 75 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10">
              <Link to="/practice" className="w-full">
                <Button variant="primary" size="sm" className="w-full justify-between">
                  <span>Practice Weak Areas</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Session Performance Table */}
        <Card className="p-6 space-y-4 border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Recent Presentation Telemetry
            </h3>
            <Link to="/history" className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View Full History <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Presentation Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Speaking Pace</th>
                  <th className="py-3 px-4">Filler Count</th>
                  <th className="py-3 px-4">Clarity</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentSessions.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{s.title}</td>
                    <td className="py-3.5 px-4 text-slate-400">{s.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {s.score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold">{s.wpm} WPM</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">{s.fillers} detected</td>
                    <td className="py-3.5 px-4 text-cyan-400 font-bold">{s.clarity}%</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to="/report" className="text-purple-400 hover:underline font-semibold">
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};
