import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  presentationId: { type: String, required: true, index: true },
  stage1AnalysisJson: { type: mongoose.Schema.Types.Mixed, default: null },
  concepts: [{ type: String }],
  conceptDetails: [
    {
      conceptId: { type: String },
      topic: { type: String },
      slideNumber: { type: Number },
      details: [{ type: String }],
      explanationStatus: { type: String }
    }
  ],
  coverageTable: [{ type: mongoose.Schema.Types.Mixed }],
  askedMemory: [
    {
      questionId: { type: String },
      conceptId: { type: String },
      conceptTitle: { type: String },
      questionType: { type: String }, // 'why' | 'how' | 'scenario' | 'tradeoff' | 'cross' | 'counter' | 'practical' | 'decision'
      priorityReason: { type: String }, // 'incorrect' | 'skipped' | 'weak' | 'strong-followup'
      questionText: { type: String },
      roundNumber: { type: Number },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  askedQuestions: [{ type: String }],
  coveredConcepts: [{ type: String }],
  uncoveredConcepts: [{ type: String }],
  conceptWeaknesses: [{ type: String }],
  roundNumber: { type: Number, default: 1 },
  score: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.InterviewSession || mongoose.model('InterviewSession', interviewSessionSchema);
