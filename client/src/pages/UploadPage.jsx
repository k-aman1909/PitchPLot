import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import { useAuth } from '../context/AuthContext';
import { uploadPresentationFile } from '../services/presentationService';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { SubscriptionModal } from '../components/subscription/SubscriptionModal';
import {
  Upload,
  FileCheck,
  AlertCircle,
  Sparkles,
  Presentation,
  FolderOpen,
  CheckCircle2,
  Loader2,
  Circle,
  ArrowRight,
  Crown,
  Lock
} from 'lucide-react';

export const UploadPage = () => {
  const { isOwner, isProUser, canStartSession, freeSessionsUsed, incrementFreeSessions } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Investor Pitch');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const fileInputRef = useRef(null);
  const { setActivePresentation } = usePresentation();
  const navigate = useNavigate();

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!canStartSession) {
      setIsPaywallOpen(true);
      return;
    }
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (['pdf', 'pptx', 'ppt'].includes(ext)) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    } else {
      setError('Invalid format! Only PDF (.pdf) and PowerPoint (.pptx / .ppt) files are supported.');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    if (!canStartSession) {
      setIsPaywallOpen(true);
      return;
    }

    setError('');
    setIsUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('category', category);

      const res = await uploadPresentationFile(formData, (percent) => {
        setUploadProgress(percent);
      });

      await incrementFreeSessions();
      setActivePresentation(res.presentation);
      navigate('/workspace');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload presentation. Please try again.');
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (!canStartSession) {
      setIsPaywallOpen(true);
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 w-full">
        {/* Header */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="purple" size="md" className="mb-2">
              <Upload className="w-3.5 h-3.5 mr-1" /> Presentation Deck Upload
            </Badge>
            {!isProUser && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border mb-2 ${
                freeSessionsUsed >= 2
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              }`}>
                Free Demos: {freeSessionsUsed} / 2 Used
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Upload Presentation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Upload your PowerPoint or PDF deck. SlideSense processes visual slides and prepares AI viva question prompts.
          </p>
        </div>

        {!canStartSession && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#0B1120] border border-purple-500/40 text-center space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Free Demos Limit Reached (2/2 Used)</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You have used your 2 free presentation demo sessions. Upgrade your plan to unlock unlimited presentation processing, AI viva simulations, and executive analytics!
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => setIsPaywallOpen(true)} className="shadow-lg shadow-purple-600/30">
              <Crown className="w-4 h-4 mr-2" /> Upgrade Subscription (Monthly ₹49, 1-Year ₹500)
            </Button>
          </div>
        )}

        {/* Upload Form Box */}
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.pptx,.ppt"
            className="hidden"
          />

          {/* Premium Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 relative overflow-hidden group ${
              isDragging
                ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
                : file
                ? 'border-emerald-500/60 bg-emerald-500/5'
                : 'border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900/60 hover:border-purple-500/50'
            }`}
          >
            <div className="space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10">
                {file ? <FileCheck className="w-8 h-8 text-emerald-500" /> : <Upload className="w-8 h-8" />}
              </div>

              {file ? (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Selected Deck</span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{file.name}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Click to change file</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Presentation</h3>
                  <span className="text-xs font-bold text-[#6D4AFF] dark:text-purple-400 tracking-wider block uppercase">PPTX • PPT • PDF</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Drag & Drop your presentation deck here or click to browse</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Processing Status Pipeline */}
          {isUploading && (
            <Card className="p-6 space-y-4 border-purple-500/30 bg-white dark:bg-[#0B1120]">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Processing Deck...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar progress={uploadProgress} height="h-2.5" color="purple" />
              </div>

              <div className="space-y-2 pt-2 text-xs font-semibold">
                <div className="flex items-center space-x-2 text-emerald-500 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Presentation uploaded</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-500 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Slides processed & visual vector extracted</span>
                </div>
                <div className="flex items-center space-x-2 text-[#6D4AFF] dark:text-purple-400 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing presentation content with Gemini AI</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Circle className="w-4 h-4" />
                  <span>Preparing AI interviewer session</span>
                </div>
              </div>
            </Card>
          )}

          {/* Form Options */}
          {file && !isUploading && (
            <Card className="p-6 space-y-4 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Presentation Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q3 Investor Strategy Pitch"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="Investor Pitch">Investor Pitch</option>
                    <option value="College Viva / Thesis">College Viva / Thesis</option>
                    <option value="Technical System Architecture">Technical System Architecture</option>
                    <option value="Job Interview Defense">Job Interview Defense</option>
                    <option value="Executive Board Presentation">Executive Board Presentation</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="lg" type="submit" isLoading={isUploading}>
                  <Sparkles className="w-4 h-4 mr-2" /> Start AI Interview Session
                </Button>
              </div>
            </Card>
          )}
        </form>
      </div>

      {/* Subscription Paywall Modal */}
      <SubscriptionModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
      />
    </AppShell>
  );
};
