import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  Sparkles,
  LayoutDashboard,
  Upload,
  History,
  User,
  LogOut,
  Menu,
  X,
  Presentation
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#FF9D9D] border-b border-[#E88585] shadow-md shadow-[#FF9D9D]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - SlideSense */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-md shadow-[#D66D6D]/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#FF9D9D] rounded-[10px] flex items-center justify-center">
                <Presentation className="w-5 h-5 text-white group-hover:animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-white tracking-tight drop-shadow-xs">
                SlideSense
              </span>
              <span className="text-[10px] text-[#4A2124] tracking-wider font-extrabold uppercase -mt-1">
                AI Pitch Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-1.5">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive('/dashboard')
                    ? 'bg-white text-[#8F2E2E] shadow-sm'
                    : 'text-[#3D1F23] hover:text-[#1F0A0D] hover:bg-white/25'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-current" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/upload"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive('/upload')
                    ? 'bg-white text-[#8F2E2E] shadow-sm'
                    : 'text-[#3D1F23] hover:text-[#1F0A0D] hover:bg-white/25'
                }`}
              >
                <Upload className="w-4 h-4 text-current" />
                <span>Upload Presentation</span>
              </Link>

              <Link
                to="/history"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive('/history')
                    ? 'bg-white text-[#8F2E2E] shadow-sm'
                    : 'text-[#3D1F23] hover:text-[#1F0A0D] hover:bg-white/25'
                }`}
              >
                <History className="w-4 h-4 text-current" />
                <span>History</span>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm font-bold text-[#3D1F23] hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-bold text-[#3D1F23] hover:text-white transition-colors">How it Works</a>
            </div>
          )}

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/90 border border-white hover:bg-white transition-colors shadow-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#FF9D9D] to-[#E88585] flex items-center justify-center text-xs font-extrabold text-white shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-extrabold text-[#3D1F23]">{user?.name || 'User'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-[#3D1F23] hover:text-[#8F2E2E] hover:bg-white/30 rounded-xl transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-[#3D1F23] hover:bg-white/30">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary" size="sm" className="bg-white text-[#8F2E2E] border-none shadow-sm">
                    <Sparkles className="w-4 h-4 mr-1.5 text-[#FF9D9D]" />
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100"
              >
                Upload Presentation
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100"
              >
                History & Reports
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100"
              >
                Profile & Settings
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 font-medium">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-purple-600 font-bold">Register Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
