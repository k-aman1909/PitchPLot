import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SubscriptionModal } from '../components/subscription/SubscriptionModal';
import {
  Mail,
  Sparkles,
  CheckCircle2,
  Zap,
  Award,
  Settings,
  User,
  Crown,
  Camera,
  Save,
  Upload,
  Edit2,
  ShieldCheck,
  Check,
  CreditCard,
  Star
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile, isProUser } = useAuth();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Check if current user is owner (owner email or role)
  const isOwner = user?.role === 'owner' || user?.isOwner || user?.email?.toLowerCase().includes('admin') || user?.email?.toLowerCase().includes('owner') || user?.email === 'aman@slidesense.ai';

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size is too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      await updateProfile({
        name,
        bio,
        avatar
      });
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 w-full">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <Badge variant="purple" size="sm" className="mb-1">Account & Settings</Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Presenter Profile & Settings</h1>
          </div>

          {successMessage && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4" /> {successMessage}
            </div>
          )}
        </div>

        {/* Profile Card & Photo Uploader */}
        <Card className="p-6 sm:p-8 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar Container with Upload Badge */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-1 shadow-lg shadow-purple-500/20 overflow-hidden">
                <div className="w-full h-full bg-white dark:bg-[#070B14] rounded-[12px] flex items-center justify-center text-3xl font-extrabold text-purple-600 dark:text-purple-400 overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{name ? name.charAt(0).toUpperCase() : 'A'}</span>
                  )}
                </div>
              </div>

              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/40 cursor-pointer transition-transform group-hover:scale-110 flex items-center justify-center"
                title="Upload Profile Picture"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{name || 'Aman Kumar'}</h2>
                {isOwner ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-extrabold flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 fill-current" /> Owner / Admin Account
                  </span>
                ) : (
                  <Badge variant={user?.isPro ? "emerald" : "purple"} size="sm">
                    <Sparkles className="w-3 h-3 mr-1" /> {user?.plan || 'Pro Coach Plan'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email || 'aman@slidesense.ai'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1 max-w-md">
                "{bio || 'Mastering technical interview defense and presentation speech delivery.'}"
              </p>
            </div>
          </div>

          {/* Profile Edit Form */}
          <form onSubmit={handleSubmit} className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400" /> Edit Profile Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Email Address (Read Only)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Presenter Bio / Headline</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your role or core presentation goals..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                className="shadow-md shadow-purple-600/30"
              >
                <Save className="w-4 h-4 mr-1.5" /> Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI & Speech Engine Status */}
          <Card className="p-6 space-y-4 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
              <Zap className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              Speech & AI Engine Configuration
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">AI Model Engine</span>
                  <span className="text-slate-500 dark:text-slate-400">Gemini 1.5 Flash AI Engine</span>
                </div>
                <Badge variant="emerald" size="sm">Connected</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Speech Recognition</span>
                  <span className="text-slate-500 dark:text-slate-400">Web Speech API (Realtime)</span>
                </div>
                <Badge variant="emerald" size="sm">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Target Speaking Pace</span>
                  <span className="text-slate-500 dark:text-slate-400">120 - 160 WPM (Optimal)</span>
                </div>
                <span className="text-[#6D4AFF] dark:text-purple-400 font-bold">Configured</span>
              </div>
            </div>
          </Card>

          {/* Subscription & Features */}
          <Card className="p-6 space-y-4 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
              <Crown className="w-5 h-5 text-[#6D4AFF] dark:text-purple-400" />
              Subscription Status
            </h3>

            {isOwner ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-amber-700 dark:text-amber-300">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <Star className="w-4 h-4 fill-current text-amber-500" />
                  <span>Owner Account (Lifetime Access)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  As the platform owner, you have full lifetime access to all Pro features, unlimited presentation processing, AI viva generation, and analytics without subscription limits.
                </p>
              </div>
            ) : isProUser ? (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-3 text-xs text-purple-900 dark:text-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-sm text-[#6D4AFF] dark:text-purple-300">
                    <Crown className="w-4 h-4" />
                    <span>SlideSense Pro Plan Active</span>
                  </div>
                  <Badge variant="emerald" size="sm">₹299/mo</Badge>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your Pro subscription is active. You have access to unlimited presentations, advanced AI viva simulations, weak-area practice drills, and detailed executive reports.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="w-full text-xs"
                >
                  Manage Pro Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">Current Plan</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Free Tier (2 Demo Presentations)</span>
                  </div>
                  <Badge variant="purple" size="sm">Free</Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>Unlimited Presentation Uploads (.pdf, .pptx, .ppt)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>Adaptive 20-Prompt AI Viva Interview Simulation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>Realtime Speech Pace & Filler Word Detection</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="w-full shadow-md shadow-purple-600/30"
                  >
                    <CreditCard className="w-4 h-4 mr-2" /> Upgrade to Pro (₹299/mo)
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Subscription & Payment Gateway Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </AppShell>
  );
};
