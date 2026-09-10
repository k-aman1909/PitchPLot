import express from 'express';
import {
  uploadPresentation,
  getUserPresentations,
  getPresentationById,
  deletePresentation
} from '../controllers/presentationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadPresentation);
router.get('/', protect, getUserPresentations);
router.get('/:id', protect, getPresentationById);
router.delete('/:id', protect, deletePresentation);

export default router;
