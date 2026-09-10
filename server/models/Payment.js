import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, required: true },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true }, // Amount in paise (29900 = ₹299)
  currency: { type: String, default: 'INR' },
  plan: { type: String, default: 'pro' },
  status: { type: String, enum: ['created', 'captured', 'failed', 'refunded'], default: 'created' },
  receipt: { type: String }
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
