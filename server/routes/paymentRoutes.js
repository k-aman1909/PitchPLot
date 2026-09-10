import express from 'express';
import { createOrder, verifyPayment, getPaymentHistory, handleWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected Payment Endpoints
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

// Public Webhook Endpoint
router.post('/webhook', handleWebhook);

export default router;
