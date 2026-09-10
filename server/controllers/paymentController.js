import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import mongoose from 'mongoose';
import { createRazorpayOrder, verifyRazorpaySignature, getRazorpayKeyId } from '../services/razorpayService.js';
import { sendPaymentConfirmationEmail } from '../services/emailService.js';
import crypto from 'crypto';

/**
 * Creates a Razorpay Order for Pro Subscription (₹299 = 29900 paise)
 * Endpoint: POST /api/payment/create-order
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const PRO_PRICE_PAISE = 29900; // ₹299 in paise
    const CURRENCY = 'INR';
    const receipt = `receipt_pro_${userId}_${Date.now()}`;

    const order = await createRazorpayOrder(PRO_PRICE_PAISE, CURRENCY, receipt);

    if (!order || !order.id) {
      return res.status(500).json({ success: false, message: 'Failed to create Razorpay order.' });
    }

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount || PRO_PRICE_PAISE,
      currency: order.currency || CURRENCY,
      keyId: getRazorpayKeyId(),
      receipt: order.receipt || receipt
    });
  } catch (error) {
    console.error('[Payment Controller] createOrder Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate Razorpay order.',
      error: error.message
    });
  }
};

/**
 * Verifies Razorpay Payment Signature and upgrades User to PRO
 * Endpoint: POST /api/payment/verify
 */
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing razorpay_order_id or razorpay_payment_id in request.'
      });
    }

    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      console.warn(`[Payment Verification Failed] User ${userId}, Order ${razorpay_order_id}`);

      // Record failed transaction attempt
      if (mongoose.connection.readyState === 1) {
        await Payment.create({
          userId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id || 'UNKNOWN',
          razorpaySignature: razorpay_signature || '',
          amount: 29900,
          currency: 'INR',
          plan: 'pro',
          status: 'failed'
        }).catch(e => console.error('Error saving failed payment log:', e));
      } else {
        inMemoryStore.insert('payments', {
          userId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id || 'UNKNOWN',
          razorpaySignature: razorpay_signature || '',
          amount: 29900,
          currency: 'INR',
          plan: 'pro',
          status: 'failed'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Razorpay payment signature verification failed. Plan was not upgraded.'
      });
    }

    // Verification Succeeded! Upgrade User Plan to PRO
    const startDate = new Date();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days Pro access

    let updatedUser = null;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId);
      if (user) {
        user.plan = 'pro';
        user.subscriptionStatus = 'active';
        user.currentOrderId = razorpay_order_id;
        user.subscriptionStartDate = startDate;
        user.subscriptionEndDate = endDate;
        updatedUser = await user.save();

        await Payment.create({
          userId: user._id,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: 29900,
          currency: 'INR',
          plan: 'pro',
          status: 'captured'
        });
      }
    } else {
      const user = inMemoryStore.findById('users', userId);
      if (user) {
        user.plan = 'pro';
        user.subscriptionStatus = 'active';
        user.currentOrderId = razorpay_order_id;
        user.subscriptionStartDate = startDate;
        user.subscriptionEndDate = endDate;
        updatedUser = inMemoryStore.update('users', userId, user);

        inMemoryStore.insert('payments', {
          userId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: 29900,
          currency: 'INR',
          plan: 'pro',
          status: 'captured'
        });
      }
    }

    // Send Payment Receipt & Subscription Confirmation Email
    sendPaymentConfirmationEmail({
      email: updatedUser?.email || req.user.email,
      name: updatedUser?.name || req.user.name,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: '₹299',
      planName: 'SlideSense Pro Plan',
      date: startDate.toLocaleDateString()
    }).catch(e => console.error('[Payment Confirmation Email Error]:', e));

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      plan: 'pro',
      user: {
        id: updatedUser?._id || updatedUser?.id || userId,
        name: updatedUser?.name || req.user.name,
        email: updatedUser?.email || req.user.email,
        plan: 'pro',
        subscriptionStatus: 'active',
        subscriptionEndDate: endDate.toISOString()
      }
    });
  } catch (error) {
    console.error('[Payment Controller] verifyPayment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying Razorpay payment signature.',
      error: error.message
    });
  }
};

/**
 * Fetch payment transaction history for current user
 * Endpoint: GET /api/payment/history
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    let history = [];

    if (mongoose.connection.readyState === 1) {
      history = await Payment.find({ userId }).sort({ createdAt: -1 });
    } else {
      history = inMemoryStore.find('payments', { userId });
    }

    return res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching payment history' });
  }
};

/**
 * Handle optional Razorpay webhook events
 * Endpoint: POST /api/payment/webhook
 */
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'slidesense_webhook_secret';
    const razorpaySignature = req.headers['x-razorpay-signature'];

    if (razorpaySignature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== razorpaySignature) {
        return res.status(400).json({ status: 'failure', message: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    console.log(`[Razorpay Webhook Received] Event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      if (paymentEntity && paymentEntity.order_id) {
        // Optional webhook state synchronization
        console.log(`[Webhook] Order ${paymentEntity.order_id} marked paid.`);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ status: 'error' });
  }
};
