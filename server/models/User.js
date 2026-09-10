import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { type: String, default: 'user' },
  bio: { type: String, default: 'Presentation enthusiast' },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  razorpayCustomerId: { type: String, default: '' },
  currentOrderId: { type: String, default: '' },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
  freeSessionsUsed: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
