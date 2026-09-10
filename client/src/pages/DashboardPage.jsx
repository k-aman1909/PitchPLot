import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePresentation } from '../context/PresentationContext';
import { fetchUserPresentations, deletePresentationById } from '../services/presentationService';
import { fetchUserReports } from '../services/reportService';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ScoreGauge } from '../components/reports/ScoreGauge';
import { SubscriptionModal } from '../components/subscription/SubscriptionModal';
import {
  Upload,
  Play,
  Award,
  TrendingUp,
  Clock,
  ChevronRight,
  Layers,
  Sparkles,
  Plus,
  Presentation,
  Trash2,
  HelpCircle,
  BrainCircuit,
  Target,
  BarChart3,
  ArrowUpRight,
  Mic,
  Zap,
  CheckCircle2,
  Crown,
  Lock
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, isOwner, isProUser, canStartSession, freeSessionsUsed } = useAuth();
  const { setActivePresentation, setActiveReport } = usePresentation();
  const navigate = useNavigate();

  const [presentations, setPresentations] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [presData, repData] = await Promise.all([
        fetchUserPresentations(),
        fetchUserReports()
      ]);
      setPresentations(presData);
      setReports(repData);
    } catch (err) {
      console.warn('Dashboard fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const averageScore = reports.length > 0
    ? Math.round(reports.reduce((acc, r) => acc + (r.overallScore || 0), 0) / reports.length)
    : 78;

  const totalSessions = reports.length > 0 ? reports.length : 24;
  const questionsAnswered = reports.length > 0 ? reports.length * 8 : 156;

  const handleStartPractice = (pres) => {
    if (!canStartSession) {
      setIsPaywallOpen(true);
      return;
    }
    setActivePresentation(pres);
    navigate('/workspace');
  };

  const handleDirectQAPractice = (pres) => {
    if (!canStartSession) {
      setIsPaywallOpen(true);
      return;
    }
    setActivePresentation(pres);
    navigate('/qa-round');
  };

  const handleDeleteDeck = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this presentation deck?')) return;
    setDeletingId(id);
    try {
      await deletePresentationById(id);
      setPresentations(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch (err) {
      console.error('Delete presentation error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 w-full">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Good morning, {user?.name ? user.name.split(' ')[0] : 'Aman'} 👋
              </h1>
              {isOwner ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 fill-current" /> Owner / Admin
                </span>
              ) : isProUser ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-1">
                  👑 Pro Unlimited
                </span>
              ) : (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  freeSessionsUsed >= 2
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                }`}>
                  Free Demos: {freeSessionsUsed} / 2 Used
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Let's improve your presentation skills today.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/upload">
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4 mr-1.5" />
                Upload New Deck
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Key Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-5 space-y-2 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Sessions</span>
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-[#6D4AFF] dark:text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalSessions}</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">+12 this week</span>
          </Card>

          <Card className="p-5 space-y-2 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Score</span>
              <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-[#6D4AFF] dark:text-cyan-400">{averageScore}%</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">+14% vs last month</span>
          </Card>

          <Card className="p-5 space-y-2 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Questions Answered</span>
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-purple-400">{questionsAnswered}</span>
            </div>
            <span className="text-[11px] font-bold text-[#6D4AFF] dark:text-purple-400 flex items-center gap-1">+28 this week</span>
          </Card>

          <Card className="p-5 space-y-2 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Improvement</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">+14%</span>
            </div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">+4% vs last month</span>
          </Card>
        </div>

        {/* Continue Practicing Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <Layers className="w-5 h-5 text-[#6D4AFF] dark:text-purple-400" /> Continue Practicing
            </h2>
            <Link to="/history" className="text-xs font-bold text-[#6D4AFF] dark:text-purple-400 hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((n) => (
                <Card key={n} className="p-6 h-48 bg-slate-100 dark:bg-slate-900/40 animate-pulse border-slate-200 dark:border-white/5" />
              ))}
            </div>
          ) : presentations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {presentations.slice(0, 4).map((pres) => {
                const presId = pres._id || pres.id;
                const slideNum = pres.slides?.length || pres.slideCount || 24;

                return (
                  <Card
                    key={presId}
                    className="p-6 flex flex-col justify-between space-y-4 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-16 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex flex-col items-center justify-center text-[#6D4AFF] dark:text-purple-400 shrink-0">
                          <Presentation className="w-6 h-6 mb-1" />
                          <span className="text-[9px] font-bold uppercase">PPTX</span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#6D4AFF] dark:group-hover:text-purple-300 transition-colors">
                            {pres.title || 'AI Product Pitch'}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {slideNum} Slides • Last practiced 2h ago
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <ScoreGauge score={82} size="sm" label="" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        Slide 4 of {slideNum}
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleDeleteDeck(e, presId)}
                          disabled={deletingId === presId}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete Deck"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDirectQAPractice(pres)}
                          className="text-xs shadow-md shadow-purple-600/30"
                        >
                          <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Continue Session
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900/40 space-y-4">
              <Presentation className="w-12 h-12 text-[#6D4AFF] dark:text-purple-400 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Presentations Uploaded Yet</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Upload your PPT, PPTX, or PDF deck to start practicing live speech delivery and AI Q&A viva simulations.
                </p>
              </div>
              <Link to="/upload">
                <Button variant="primary" size="md">
                  <Upload className="w-4 h-4 mr-2" /> Upload Your First Deck
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Performance Overview & Areas to Improve Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Overview Chart Card */}
          <Card className="lg:col-span-2 p-6 space-y-4 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400" /> Performance Overview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Score improvement across recent presentation sessions</p>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                Last 4 Weeks ▾
              </span>
            </div>

            <div className="h-48 w-full bg-slate-50 dark:bg-[#0B1120] rounded-xl p-4 border border-slate-200 dark:border-white/5 flex flex-col justify-between relative overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
                <path
                  d="M 0 90 Q 75 70 150 80 T 300 40 T 450 30 L 500 15 L 500 120 L 0 120 Z"
                  fill="rgba(109, 74, 255, 0.15)"
                />
                <path
                  d="M 0 90 Q 75 70 150 80 T 300 40 T 450 30 L 500 15"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="3"
                />
                <circle cx="150" cy="80" r="4" fill="#7C3AED" />
                <circle cx="300" cy="40" r="4" fill="#6366F1" />
                <circle cx="500" cy="15" r="5" fill="#06B6D4" />
              </svg>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase pt-2 border-t border-slate-200 dark:border-white/5">
                <span>May 6</span>
                <span>May 13</span>
                <span>May 20</span>
                <span>May 27</span>
                <span>Jun 3</span>
              </div>
            </div>
          </Card>

          {/* Areas to Improve Card */}
          <Card className="p-6 space-y-4 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Areas to Improve
              </h3>
              <Link to="/analytics" className="text-xs font-bold text-[#6D4AFF] dark:text-purple-400 hover:underline">
                View Details
              </Link>
            </div>

            <div className="space-y-3.5">
              {[
                { topic: 'Answer Depth', score: '68%', pct: 68, color: 'bg-amber-500' },
                { topic: 'Critical Thinking', score: '61%', pct: 61, color: 'bg-rose-500' },
                { topic: 'Speaking Pace', score: '87%', pct: 87, color: 'bg-emerald-500' },
                { topic: 'Confidence', score: '78%', pct: 78, color: 'bg-cyan-500' },
              ].map((area, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{area.topic}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{area.score}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${area.color} rounded-full`} style={{ width: `${area.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Recommendation Banner */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-[#0B1120] border-purple-200 dark:border-purple-500/30 relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center space-x-2">
                <Badge variant="purple" size="sm">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Recommendation
                </Badge>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                "Your technical understanding is strong. Practice defending your design decisions and explaining trade-offs to improve your score."
              </h3>
            </div>

            <Link to="/practice">
              <Button variant="primary" size="md" className="shrink-0">
                <span>Practice Weak Areas</span>
                <ArrowUpRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Subscription Paywall Modal */}
      <SubscriptionModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
      />
    </AppShell>
  );
};
