import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getMe,
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile as apiUpdateProfile,
  sendSignupOTP as apiSendOTP,
  verifyOTPAndRegister as apiVerifyOTPAndRegister
} from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Free session counter fallback from localStorage
  const [freeSessionsUsed, setFreeSessionsUsed] = useState(() => {
    const saved = localStorage.getItem('slidesense_free_sessions');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('slidesense_token') || localStorage.getItem('pitchplot_token');
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
          if (userData.freeSessionsUsed !== undefined) {
            setFreeSessionsUsed(userData.freeSessionsUsed);
          }
        } catch (err) {
          console.warn('Session expired or token invalid');
          logoutUser();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const isOwner = user?.role === 'owner' || user?.isOwner || user?.email?.toLowerCase().includes('admin') || user?.email?.toLowerCase().includes('owner') || user?.email === 'aman@slidesense.ai';

  const isProUser = isOwner || !!user?.isPro || user?.plan === 'pro';

  const refreshUser = async () => {
    try {
      const userData = await getMe();
      if (userData) {
        setUser(userData);
      }
    } catch (e) {}
  };

  const canStartSession = isProUser || freeSessionsUsed < 2;

  const incrementFreeSessions = async () => {
    if (isProUser) return true;

    const nextCount = freeSessionsUsed + 1;
    setFreeSessionsUsed(nextCount);
    localStorage.setItem('slidesense_free_sessions', nextCount.toString());

    try {
      await apiUpdateProfile({ freeSessionsUsed: nextCount });
    } catch (e) {}

    return nextCount <= 2;
  };

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    setUser(res.user);
    if (res.user?.freeSessionsUsed !== undefined) {
      setFreeSessionsUsed(res.user.freeSessionsUsed);
    }
    return res;
  };

  const sendOTP = async (email) => {
    return await apiSendOTP(email);
  };

  const verifyOTPAndRegister = async ({ name, email, password, otp }) => {
    const res = await apiVerifyOTPAndRegister({ name, email, password, otp });
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await registerUser(name, email, password);
    setUser(res.user);
    return res;
  };

  const updateProfile = async (profileData) => {
    try {
      const updated = await apiUpdateProfile(profileData);
      setUser(updated);
      return updated;
    } catch (err) {
      console.warn('Backend update notice:', err.message);
      setUser(prev => ({ ...prev, ...profileData }));
      return profileData;
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        sendOTP,
        verifyOTPAndRegister,
        updateProfile,
        refreshUser,
        setUser,
        logout,
        isAuthenticated: !!user,
        isOwner,
        isProUser,
        freeSessionsUsed,
        canStartSession,
        incrementFreeSessions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
