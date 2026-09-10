import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  questionId: { type: String, required: true, index: true },
  presentationId: { type: String, required: true },
  userTranscript: { type: String, required: true },
  audioUrl: { type: String, default: '' },
  score: { type: Number, min: 0, max: 100, default: 0 },
  feedback: { type: String, default: '' },
  keyPointsCovered: [{ type: String }],
  missingPoints: [{ type: String }],
  improvementTips: [{ type: String }],
  modelAnswer: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Answer || mongoose.model('Answer', answerSchema);
