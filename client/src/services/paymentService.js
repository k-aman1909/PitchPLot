import api from './api';

/**
 * Dynamically loads Razorpay Checkout SDK Script (https://checkout.razorpay.com/v1/checkout.js)
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Creates a Razorpay Order on the backend
 * @returns {Promise<{success: boolean, orderId: string, amount: number, currency: string, keyId: string}>}
 */
export const createPaymentOrder = async () => {
  const response = await api.post('/payment/create-order');
  return response.data;
};

/**
 * Verifies Razorpay payment signature on the backend
 * @param {Object} paymentData
 * @param {string} paymentData.razorpay_order_id
 * @param {string} paymentData.razorpay_payment_id
 * @param {string} paymentData.razorpay_signature
 */
export const verifyPaymentSignature = async (paymentData) => {
  const response = await api.post('/payment/verify', paymentData);
  return response.data;
};

/**
 * Fetches transaction history for current logged in user
 */
export const getPaymentHistory = async () => {
  const response = await api.get('/payment/history');
  return response.data;
};
