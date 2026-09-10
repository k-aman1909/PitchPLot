import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  presentationId: { type: String, required: true, index: true },
  reportId: { type: String, default: '' },
  questionId: { type: String },
  conceptId: { type: String },
  conceptTitle: { type: String },
  questionType: { type: String, default: 'scenario' }, // 'why' | 'how' | 'scenario' | 'tradeoff' | 'cross' | 'counter' | 'practical' | 'decision'
  priorityReason: { type: String, default: 'weak' }, // 'incorrect' | 'skipped' | 'weak' | 'strong-followup'
  questionText: { type: String, required: true },
  roundNumber: { type: Number, default: 1 },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  slideNumber: { type: Number, default: 1 },
  interviewerPersona: { type: String, default: 'Executive Interviewer' },
  idealAnswerHint: { type: String, default: '' },
  expectedKeyPoints: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', questionSchema);
