import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateUserProfile,
  sendSignupOTP,
  verifyOTPAndRegister
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// OTP Email Verification Routes
router.post('/send-otp', sendSignupOTP);
router.post('/resend-otp', sendSignupOTP);
router.post('/verify-otp-register', verifyOTPAndRegister);

// Standard Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);

export default router;
