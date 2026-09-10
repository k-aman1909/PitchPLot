import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { sendOTPEmail } from '../services/emailService.js';
import mongoose from 'mongoose';

const generateToken = (id, name, email) => {
  return jwt.sign(
    { id, name, email },
    process.env.JWT_SECRET || 'pitchplot_secret_key_2026',
    { expiresIn: '30d' }
  );
};

// Generate 6-digit random numeric OTP string
const generateNumericOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Step 1: Send OTP to email address before creating account
 * Endpoint: POST /api/auth/send-otp
 */
export const sendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email address already exists.' });
      }
    } else {
      const userExists = inMemoryStore.findOne('users', { email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email address already exists.' });
      }
    }

    // Generate 6-digit OTP and set 10-minute expiry
    const otpCode = generateNumericOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes

    // Save OTP to DB or Memory Store
    if (mongoose.connection.readyState === 1) {
      // Remove any existing OTPs for this email first
      await OTP.deleteMany({ email: cleanEmail });
      await OTP.create({
        email: cleanEmail,
        otp: otpCode,
        expiresAt
      });
    } else {
      const existingOtps = inMemoryStore.find('otps', { email: cleanEmail });
      existingOtps.forEach(o => inMemoryStore.delete('otps', o._id || o.id));
      inMemoryStore.insert('otps', {
        email: cleanEmail,
        otp: otpCode,
        expiresAt: expiresAt.toISOString()
      });
    }

    // Dispatch OTP Email
    const emailResult = await sendOTPEmail(cleanEmail, otpCode);

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Please check your email inbox.`,
      email: cleanEmail
    });
  } catch (err) {
    console.error('sendSignupOTP Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP verification email.',
      error: err.message
    });
  }
};

/**
 * Step 2: Verify OTP and Complete Registration
 * Endpoint: POST /api/auth/verify-otp-register
 */
export const verifyOTPAndRegister = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, password, and 6-digit OTP code.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOTP = otp.toString().trim();

    // Verify OTP record
    let validOTP = null;

    if (mongoose.connection.readyState === 1) {
      validOTP = await OTP.findOne({ email: cleanEmail, otp: cleanOTP });
    } else {
      validOTP = inMemoryStore.findOne('otps', { email: cleanEmail, otp: cleanOTP });
    }

    if (!validOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    // Check expiration
    const expiryTime = new Date(validOTP.expiresAt).getTime();
    if (Date.now() > expiryTime) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please click "Resend OTP" to receive a new code.'
      });
    }

    // Hash password & Create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser = null;

    if (mongoose.connection.readyState === 1) {
      // Check user exists again
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists.' });
      }

      newUser = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        isEmailVerified: true
      });

      // Remove used OTP
      await OTP.deleteMany({ email: cleanEmail });
    } else {
      const userExists = inMemoryStore.findOne('users', { email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists.' });
      }

      newUser = inMemoryStore.insert('users', {
        name,
        email: cleanEmail,
        password: hashedPassword,
        avatar: '',
        bio: 'Presentation enthusiast',
        plan: 'free',
        subscriptionStatus: 'inactive',
        freeSessionsUsed: 0,
        isEmailVerified: true
      });

      // Remove used OTP
      const existingOtps = inMemoryStore.find('otps', { email: cleanEmail });
      existingOtps.forEach(o => inMemoryStore.delete('otps', o._id || o.id));
    }

    const userId = newUser._id || newUser.id;
    const token = generateToken(userId, newUser.name, newUser.email);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar || '',
        bio: newUser.bio || '',
        plan: newUser.plan || 'free',
        isEmailVerified: true
      }
    });
  } catch (err) {
    console.error('verifyOTPAndRegister Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error completing registration',
      error: err.message
    });
  }
};

/**
 * Standard Register User (Direct signup fallback or test flow)
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        isEmailVerified: true
      });

      const token = generateToken(user._id, user.name, user.email);

      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || '',
          bio: user.bio || '',
          plan: user.plan || 'free',
          isEmailVerified: true
        }
      });
    } else {
      // Memory Store Fallback
      const userExists = inMemoryStore.findOne('users', { email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const newUser = inMemoryStore.insert('users', {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: '',
        bio: 'Presentation enthusiast',
        plan: 'free',
        subscriptionStatus: 'inactive',
        freeSessionsUsed: 0,
        isEmailVerified: true
      });

      const token = generateToken(newUser._id, newUser.name, newUser.email);

      return res.status(201).json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar || '',
          bio: newUser.bio || '',
          plan: newUser.plan || 'free',
          isEmailVerified: true
        }
      });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error registering user', error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = inMemoryStore.findOne('users', { email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userId = user._id || user.id;
    const token = generateToken(userId, user.name, user.email);

    res.json({
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        bio: user.bio || '',
        plan: user.plan || 'free',
        isEmailVerified: user.isEmailVerified !== undefined ? user.isEmailVerified : true
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId).select('-password');
    } else {
      user = inMemoryStore.findById('users', userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    res.json({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      bio: user.bio || '',
      plan: user.plan || 'free',
      isEmailVerified: user.isEmailVerified !== undefined ? user.isEmailVerified : true
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar, bio, freeSessionsUsed } = req.body;

    let updatedUser = null;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (name) user.name = name;
      if (avatar !== undefined) user.avatar = avatar;
      if (bio !== undefined) user.bio = bio;
      if (freeSessionsUsed !== undefined) user.freeSessionsUsed = freeSessionsUsed;

      updatedUser = await user.save();
    } else {
      const user = inMemoryStore.findById('users', userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (name) user.name = name;
      if (avatar !== undefined) user.avatar = avatar;
      if (bio !== undefined) user.bio = bio;
      if (freeSessionsUsed !== undefined) user.freeSessionsUsed = freeSessionsUsed;

      updatedUser = inMemoryStore.update('users', userId, user);
    }

    res.json({
      id: updatedUser._id || updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar || '',
      bio: updatedUser.bio || '',
      plan: updatedUser.plan || 'free',
      freeSessionsUsed: updatedUser.freeSessionsUsed || 0
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};
