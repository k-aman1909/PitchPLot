import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  presentationId: { type: String, required: true, index: true },
  presentationTitle: { type: String, default: '' },
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  scores: {
    contentQuality: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    fluency: { type: Number, default: 0 },
    grammar: { type: Number, default: 0 },
    presentationFlow: { type: Number, default: 0 },
    timeManagement: { type: Number, default: 0 }
  },
  metrics: {
    durationSeconds: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 },
    wpm: { type: Number, default: 0 },
    wpmStatus: { type: String, enum: ['Slow', 'Optimal', 'Fast'], default: 'Optimal' },
    fillerWordCount: { type: Number, default: 0 },
    fillerWordPercentage: { type: Number, default: 0 },
    fillerWordsBreakdown: [{
      word: String,
      count: Number
    }]
  },
  transcript: { type: String, default: '' },
  strongAreas: [{ type: String }],
  weakAreas: [{ type: String }],
  suggestions: [{ type: String }],
  summary: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
