import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from '../common/BrandLogo';
import { SubscriptionModal } from '../subscription/SubscriptionModal';
import {
  Sparkles,
  LayoutDashboard,
  Presentation,
  History,
  BarChart3,
  FileText,
  Target,
  Settings,
  LogOut,
  Crown,
  Menu,
  X,
  ChevronRight,
  Upload,
  User,
  Sun,
  Moon,
  Search,
  Bell
} from 'lucide-react';

export const AppShell = ({ children }) => {
  const { user, logout, isProUser } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const isOwner = user?.role === 'owner' || user?.isOwner || user?.email?.toLowerCase().includes('admin') || user?.email?.toLowerCase().includes('owner') || user?.email === 'aman@slidesense.ai';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Present', path: '/workspace', icon: Presentation },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/report', icon: FileText },
    { name: 'Practice', path: '/practice', icon: Target },
    { name: 'Settings', path: '/profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#070B14] text-slate-900 dark:text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-purple-500 selection:text-white transition-colors duration-200">
      {/* Mobile Top Navbar Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-white/10 z-40">
        <Link to="/dashboard">
          <BrandLogo size="sm" />
        </Link>

        <div className="flex items-center space-x-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-purple-600 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-white/5 flex flex-col justify-between p-4 transition-all duration-300 ease-in-out shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Official Brand Logo Header */}
          <Link to="/dashboard" className="block px-2 py-3 mb-4">
            <BrandLogo size="md" />
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                    active
                      ? 'bg-purple-50 dark:bg-purple-600/30 text-[#6D4AFF] dark:text-white border border-purple-200 dark:border-purple-500/40 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 transition-colors ${active ? 'text-[#6D4AFF] dark:text-purple-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-[#6D4AFF] dark:group-hover:text-purple-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-[#6D4AFF] dark:bg-purple-400 shadow-sm" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Widgets */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/5">
          {/* Pro Upgrade Card */}
          <div className="bg-gradient-to-b from-purple-50 to-indigo-50/60 dark:from-slate-900/80 dark:to-purple-950/40 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-3.5 space-y-2.5 relative overflow-hidden group">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-[#6D4AFF] dark:text-purple-300">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isOwner ? 'Owner Account' : 'Upgrade to Pro'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
              {isOwner ? 'Full lifetime access to unlimited AI viva & presentation analytics.' : 'Unlock advanced analytics, custom interviews, and unlimited decks.'}
            </p>
            {!isOwner && (
              <button
                onClick={() => setIsSubModalOpen(true)}
                className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all text-center block"
              >
                Upgrade Now
              </button>
            )}
          </div>

          {/* User Profile Footer Pill */}
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 cursor-pointer hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shrink-0 overflow-hidden">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#070B14] flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{user?.name || 'Aman Kumar'}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {isOwner ? 'Platform Owner' : (isProUser ? 'Pro Plan' : 'Free Plan')}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main SaaS Workspace Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#F7F8FC] dark:bg-[#070B14] flex flex-col min-h-screen">
        {/* Top Header App Bar with Search & Theme Toggle */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative hidden sm:block w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-all shadow-xs"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <Bell className="w-4 h-4" />
            </button>

            <div
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              title="View Profile & Settings"
            >
              <div className="w-full h-full rounded-full bg-white dark:bg-[#070B14] flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Global Subscription & Payment Gateway Modal */}
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
      />
    </div>
  );
};
