import express from 'express';
import {
  generateQuestionsForPresentation,
  getQuestionsByPresentation,
  submitAnswer,
  getUserAnswers,
  getInterviewSessionDebug
} from '../controllers/qaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate-questions', protect, generateQuestionsForPresentation);
router.post('/generate', protect, generateQuestionsForPresentation);
router.get('/questions/:presentationId', protect, getQuestionsByPresentation);
router.get('/session-debug/:presentationId', protect, getInterviewSessionDebug);
router.post('/submit-answer', protect, submitAnswer);
router.get('/answers', protect, getUserAnswers);

export default router;
