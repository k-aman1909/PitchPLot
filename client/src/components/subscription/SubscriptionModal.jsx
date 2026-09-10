import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  loadRazorpayScript,
  createPaymentOrder,
  verifyPaymentSignature
} from '../../services/paymentService';
import {
  Crown,
  CheckCircle2,
  X,
  CreditCard,
  Lock,
  Sparkles,
  Zap,
  Check,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Loader2,
  AlertCircle,
  RefreshCw,
  XCircle,
  Mail
} from 'lucide-react';

export const SubscriptionModal = ({ isOpen, onClose }) => {
  const { user, setUser, refreshUser } = useAuth();

  // Payment UI States: 'select_plan' | 'preparing' | 'checkout' | 'verifying' | 'success' | 'failed' | 'cancelled'
  const [paymentStep, setPaymentStep] = useState('select_plan');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);

  if (!isOpen) return null;

  const handleStartRazorpayCheckout = async () => {
    setErrorMessage('');
    setPaymentStep('preparing'); // "Preparing secure checkout..."

    try {
      // 1. Ensure Razorpay Checkout script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMessage('Failed to load Razorpay SDK. Please check your internet connection and try again.');
        setPaymentStep('failed');
        return;
      }

      // 2. Create Razorpay order on backend (Amount: ₹299 = 29900 paise)
      const orderData = await createPaymentOrder();

      if (!orderData || !orderData.success || !orderData.orderId) {
        setErrorMessage(orderData?.message || 'Unable to create Razorpay order. Please try again.');
        setPaymentStep('failed');
        return;
      }

      const { orderId, amount, currency, keyId } = orderData;
      setPaymentStep('checkout'); // Checkout stage initialized

      // 3. Configure Razorpay Options
      const options = {
        key: keyId || 'rzp_test_placeholder',
        amount: amount || 29900,
        currency: currency || 'INR',
        name: 'SlideSense AI',
        description: 'Pro Subscription Plan - ₹299/month',
        order_id: orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#6D4AFF'
        },
        handler: async function (response) {
          // Razorpay returns razorpay_payment_id, razorpay_order_id, razorpay_signature
          setPaymentStep('verifying'); // "Verifying payment..."

          try {
            const verifyRes = await verifyPaymentSignature({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || 'test_mock_signature'
            });

            if (verifyRes && verifyRes.success) {
              // Upgrade local state and refresh user profile from backend
              if (setUser) {
                setUser((prev) => ({
                  ...prev,
                  plan: 'pro',
                  isPro: true,
                  subscriptionStatus: 'active'
                }));
              }
              if (refreshUser) refreshUser();

              setTransactionDetails({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                amount: '₹299',
                planName: 'SlideSense Pro',
                date: new Date().toLocaleDateString()
              });

              setPaymentStep('success'); // "Payment successful 🎉"
            } else {
              setErrorMessage(verifyRes?.message || 'Payment signature verification failed.');
              setPaymentStep('failed');
            }
          } catch (verifyErr) {
            console.error('Payment Verification Exception:', verifyErr);
            setErrorMessage(
              verifyErr.response?.data?.message || 'Payment verification failed on server. Please try again.'
            );
            setPaymentStep('failed');
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentStep('cancelled'); // "Payment cancelled."
          }
        }
      };

      const isPlaceholderKey = !keyId || keyId === 'rzp_test_placeholder' || keyId === 'your_test_key_id' || (orderId && orderId.startsWith('order_test_'));

      if (isPlaceholderKey) {
        console.log('[SubscriptionModal] Running Razorpay Test Mode Verification (Placeholder Key)');
        setPaymentStep('verifying'); // "Verifying payment..."

        setTimeout(async () => {
          try {
            const verifyRes = await verifyPaymentSignature({
              razorpay_order_id: orderId,
              razorpay_payment_id: `pay_test_${Math.random().toString(36).substring(2, 10)}${Date.now()}`,
              razorpay_signature: 'test_mock_signature'
            });

            if (verifyRes && verifyRes.success) {
              if (setUser) {
                setUser((prev) => ({
                  ...prev,
                  plan: 'pro',
                  isPro: true,
                  subscriptionStatus: 'active'
                }));
              }
              if (refreshUser) refreshUser();

              setTransactionDetails({
                orderId: orderId,
                paymentId: `pay_test_${Math.floor(100000 + Math.random() * 900000)}`,
                amount: '₹299',
                planName: 'SlideSense Pro',
                date: new Date().toLocaleDateString()
              });

              setPaymentStep('success'); // "Payment successful 🎉"
            } else {
              setErrorMessage(verifyRes?.message || 'Payment verification failed.');
              setPaymentStep('failed');
            }
          } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Payment verification failed on server.');
            setPaymentStep('failed');
          }
        }, 1500);
        return;
      }

      // 4. Open Official Razorpay Checkout Window for valid registered Razorpay Keys
      if (window.Razorpay) {
        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on('payment.failed', function (resp) {
          console.error('Razorpay payment failed callback:', resp.error);
          setErrorMessage(resp.error?.description || 'Payment was declined or failed.');
          setPaymentStep('failed');
        });
        razorpayInstance.open();
      } else {
        setErrorMessage('Razorpay SDK failed to initialize.');
        setPaymentStep('failed');
      }
    } catch (err) {
      console.error('Checkout creation error:', err);
      setErrorMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
      setPaymentStep('failed');
    }
  };

  const handleCloseModal = () => {
    setPaymentStep('select_plan');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-900 dark:text-white my-8">
        
        {/* Top Header Controls: Test Mode Badge & Close Button */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Razorpay Test Mode
            </span>
          </div>

          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Title Header */}
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <Badge variant="purple" size="sm">
              <Crown className="w-3.5 h-3.5 mr-1 text-[#6D4AFF] dark:text-purple-400" />
              SlideSense Pro Subscription
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {paymentStep === 'success'
              ? 'Payment Successful! 🎉'
              : paymentStep === 'failed'
              ? 'Payment Verification Failed'
              : paymentStep === 'cancelled'
              ? 'Payment Cancelled'
              : 'Upgrade to SlideSense Pro'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {paymentStep === 'success'
              ? "You're now on SlideSense Pro. Enjoy unlimited AI presentation coaching and detailed performance reports."
              : paymentStep === 'failed'
              ? 'Your account was not upgraded. You can try again safely in test mode.'
              : 'Select a plan below to unlock unlimited presentation rehearsals and executive AI analytics.'}
          </p>
        </div>

        {/* STEP 1: PRICING COMPARISON GRID */}
        {(paymentStep === 'select_plan' || paymentStep === 'checkout') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* FREE PLAN CARD */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 space-y-4 relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">FREE PLAN</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Current
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">₹0</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">/ forever</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Basic tools for getting started with presentation practice.
                  </p>

                  <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Limited presentations (2 sessions)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Basic AI interviewer</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Basic analytics summary</span>
                    </li>
                  </ul>
                </div>

                <Button variant="secondary" size="md" disabled className="w-full mt-4 cursor-default opacity-70">
                  Included
                </Button>
              </div>

              {/* PRO PLAN CARD (FEATURED) */}
              <div className="p-5 rounded-2xl border-2 border-[#6D4AFF] dark:border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 space-y-4 relative flex flex-col justify-between shadow-lg shadow-purple-500/10">
                <span className="absolute -top-3 right-4 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs tracking-wider">
                  Recommended
                </span>

                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <Crown className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400" />
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">PRO PLAN</h3>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-[#6D4AFF] dark:text-purple-400">₹299</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ month</span>
                  </div>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                    Full AI presentation coaching power with unlimited rehearsals.
                  </p>

                  <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-200">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400 shrink-0" />
                      <span className="font-semibold">Unlimited presentations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400 shrink-0" />
                      <span>Advanced AI interviewer</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400 shrink-0" />
                      <span>Detailed AI viva reports & model answers</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400 shrink-0" />
                      <span>Advanced speech pace & filler word analytics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400 shrink-0" />
                      <span>Weak-area practice drills</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400 shrink-0" />
                      <span>Presentation performance insights</span>
                    </li>
                  </ul>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartRazorpayCheckout}
                  className="w-full mt-4 shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4 mr-1" />
                  <span>Upgrade to Pro (₹299/mo)</span>
                </Button>
              </div>

            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                256-bit SSL Secure Razorpay TEST Checkout
              </span>
              <span>Cancel anytime</span>
            </div>
          </div>
        )}

        {/* STEP 2: PREPARING SECURE CHECKOUT */}
        {paymentStep === 'preparing' && (
          <div className="py-12 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[#6D4AFF] dark:text-purple-400 animate-spin mx-auto">
              <Loader2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Preparing secure checkout...</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Contacting Razorpay backend API to initialize order #₹299 in Test Mode.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: VERIFYING PAYMENT */}
        {paymentStep === 'verifying' && (
          <div className="py-12 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-[#6D4AFF] dark:text-purple-400 animate-spin mx-auto">
              <Loader2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Verifying payment...</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Validating Razorpay cryptographic signature server-side before activating your Pro plan.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS STATE */}
        {paymentStep === 'success' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Payment successful 🎉</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                You're now on SlideSense Pro.
              </p>
            </div>

            {/* Invoice Receipt Card */}
            {transactionDetails && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400" /> Razorpay Test Receipt
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    {transactionDetails.paymentId}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Plan Activated</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{transactionDetails.planName}</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Order ID</span>
                  <strong className="text-slate-900 dark:text-white font-mono text-[11px]">
                    {transactionDetails.orderId}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Amount Charged</span>
                  <strong className="text-[#6D4AFF] dark:text-purple-400 font-black text-sm">
                    {transactionDetails.amount} / month
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-white/5">
                  <span>Verification Status</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Server-Side
                  </span>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center text-xs text-purple-700 dark:text-purple-300 flex items-center justify-center space-x-2">
              <Mail className="w-4 h-4 text-[#6D4AFF] dark:text-purple-400 shrink-0" />
              <span>A payment receipt & confirmation email has been sent to your registered email!</span>
            </div>

            <Button variant="primary" size="lg" onClick={handleCloseModal} className="w-full">
              Done & Return to Workspace
            </Button>
          </div>
        )}

        {/* STEP 5: FAILED STATE */}
        {paymentStep === 'failed' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/30">
                <XCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Payment verification failed</h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage || 'Something went wrong. Please try again.'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="md" onClick={() => setPaymentStep('select_plan')} className="flex-1">
                Back to Plans
              </Button>
              <Button variant="primary" size="md" onClick={handleStartRazorpayCheckout} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-1.5" /> Retry Payment
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: CANCELLED STATE */}
        {paymentStep === 'cancelled' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/30">
                <AlertCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Payment cancelled</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                You closed the Razorpay checkout window before completing payment.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="md" onClick={handleCloseModal} className="flex-1">
                Close
              </Button>
              <Button variant="primary" size="md" onClick={handleStartRazorpayCheckout} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
