import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Send,
  ShieldCheck
} from 'lucide-react';

export const RegisterPage = () => {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Status State: 'initial' | 'sending_otp' | 'otp_sent' | 'verifying'
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Resend Timer State
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputRef = useRef(null);
  const { sendOTP, verifyOTPAndRegister } = useAuth();
  const navigate = useNavigate();

  // Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  // Handle Send OTP Click
  const handleSendOTP = async () => {
    setError('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please enter your Name, Email, and Password first.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await sendOTP(email.trim());
      setOtpSent(true);
      setSuccessMessage(res.message || `Verification OTP code sent to ${email}. Please check your email inbox!`);
      setResendTimer(60);
      setCanResend(false);

      // Auto-focus OTP input after rendering
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP to email. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await sendOTP(email.trim());
      setSuccessMessage(`A fresh verification OTP code was sent to ${email}`);
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpSent) {
      handleSendOTP();
      return;
    }

    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit OTP code sent to your email inbox.');
      return;
    }

    setLoading(true);

    try {
      await verifyOTPAndRegister({
        name,
        email: email.trim(),
        password,
        otp: otpCode.trim()
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code. Please check your email inbox and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F8FAFC] flex flex-col font-sans selection:bg-purple-500">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-purple-500/20">
            <div className="w-full h-full bg-[#070B14] rounded-[6px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <span className="text-base font-extrabold tracking-tight text-white">SlideSense</span>
        </Link>

        <Link to="/login">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">Sign In</Button>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 my-6">
        <Card className="w-full max-w-md p-8 bg-[#0F172A] border-white/10 shadow-2xl space-y-6 relative">
          
          {/* Form Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-1">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Create SlideSense Account</h1>
            <p className="text-xs text-slate-400">
              {otpSent
                ? `Enter the 6-digit OTP code sent to ${email}`
                : 'Fill in your details below to receive an email verification OTP'}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && !error && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aman Kumar"
                  disabled={otpSent}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email Address Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] text-purple-400 font-semibold hover:underline"
                  >
                    Change Email
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aman@company.com"
                  disabled={otpSent}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={otpSent}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-60"
                />
              </div>
            </div>

            {/* SECTION 1: BUTTON TO SEND OTP */}
            {!otpSent && (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleSendOTP}
                className="w-full mt-2 shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
                isLoading={loading}
              >
                <Send className="w-4 h-4 mr-1" />
                <span>Send Verification OTP to Email</span>
              </Button>
            )}

            {/* SECTION 2: EXPANDED ENTER OTP SECTION (TRIGGERS WHEN OTP IS SENT) */}
            {otpSent && (
              <div className="space-y-4 pt-3 border-t border-purple-500/30 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Enter 6-Digit Email OTP</span>
                    <span className="text-[10px] text-slate-400 font-normal">Check Inbox</span>
                  </label>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                    <input
                      ref={otpInputRef}
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 584920"
                      className="w-full bg-[#0B1120] border-2 border-purple-500/60 rounded-xl pl-10 pr-4 py-3 text-base font-extrabold font-mono text-purple-200 placeholder-slate-600 focus:outline-none focus:border-purple-400 tracking-widest"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Didn't receive email?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-purple-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                    </button>
                  ) : (
                    <span className="text-slate-500 font-mono">Resend in {resendTimer}s</span>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-lg shadow-purple-600/30"
                  isLoading={loading}
                >
                  Verify OTP & Complete Signup
                </Button>
              </div>
            )}
          </form>

          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
