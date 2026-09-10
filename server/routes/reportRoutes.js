import express from 'express';
import { generateReport, getUserReports, getReportById } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateReport);
router.get('/', protect, getUserReports);
router.get('/:id', protect, getReportById);

export default router;
