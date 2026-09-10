import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import { fetchUserReports } from '../services/reportService';
import { fetchUserPresentations } from '../services/presentationService';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ScoreGauge } from '../components/reports/ScoreGauge';
import {
  History,
  Search,
  ChevronRight,
  Clock,
  Presentation,
  Sparkles,
  HelpCircle,
  FileText,
  Calendar,
  Layers
} from 'lucide-react';

export const HistoryPage = () => {
  const { setActiveReport, setActivePresentation } = usePresentation();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [presentations, setPresentations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const [repData, presData] = await Promise.all([
          fetchUserReports(),
          fetchUserPresentations()
        ]);
        setReports(repData);
        setPresentations(presData);
      } catch (err) {
        console.warn('History fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const filteredReports = reports.filter(r =>
    (r.presentationTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.summary || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenReport = (rep) => {
    setActiveReport(rep);
    navigate('/report');
  };

  const handlePracticeDeck = (pres) => {
    setActivePresentation(pres);
    navigate('/qa-round');
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <History className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Presentation History & Reports
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Review previous presentation audit sessions, AI evaluations, and scores.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history or decks..."
              className="w-full bg-[#0B1120] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* History Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">
            Loading historical pitch sessions...
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((rep) => {
              const repId = rep._id || rep.id;
              const dateStr = rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : 'Recent';
              const durationMin = rep.durationSeconds ? `${Math.floor(rep.durationSeconds / 60)} min` : '12 min';
              const qCount = rep.questionsCount || 20;

              return (
                <Card
                  key={repId}
                  hover
                  onClick={() => handleOpenReport(rep)}
                  className="p-5 flex flex-col justify-between space-y-4 cursor-pointer bg-[#0F172A] border-white/10 hover:border-purple-500/50 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20">
                        <Presentation className="w-5 h-5" />
                      </div>
                      <Badge variant={rep.overallScore >= 80 ? "emerald" : "amber"} size="sm">
                        {rep.overallScore >= 80 ? "Investor Ready" : "Good Progress"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                        {rep.presentationTitle || 'AI Product Pitch'}
                      </h3>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-500" /> {dateStr}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> {durationMin}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Overall Score</span>
                        <span className="text-lg font-extrabold text-purple-400">{rep.overallScore || 82}%</span>
                      </div>
                      <span className="text-slate-600">|</span>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Prompts</span>
                        <span className="text-xs font-bold text-white">{qCount} Answered</span>
                      </div>
                    </div>

                    <Button variant="primary" size="sm">
                      <span>View Report</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-white/15 bg-slate-900/40 space-y-3">
            <History className="w-10 h-10 text-purple-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Previous Session Reports</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once you complete speech delivery practice or AI interview sessions, your reports will appear here.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
};
