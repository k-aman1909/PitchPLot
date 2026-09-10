import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
  slideNumber: { type: Number, required: true },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  bulletPoints: [{ type: String }],
  keyTakeaway: { type: String, default: '' }
});

const presentationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  pdfUrl: { type: String, default: '' },
  fileName: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'pptx', 'ppt'], required: true },
  fileSize: { type: Number, default: 0 },
  slideCount: { type: Number, default: 1 },
  slides: [slideSchema],
  fullText: { type: String, default: '' },
  summary: { type: String, default: '' },
  category: { type: String, default: 'General Pitch' }
}, { timestamps: true });

export default mongoose.models.Presentation || mongoose.model('Presentation', presentationSchema);
