import Report from '../models/Report.js';
import Presentation from '../models/Presentation.js';
import { analyzePresentationTranscript } from '../services/geminiService.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import mongoose from 'mongoose';

export const generateReport = async (req, res) => {
  try {
    const { presentationId, transcript, durationSeconds } = req.body;
    const userId = req.user.id;

    if (!presentationId || !transcript) {
      return res.status(400).json({ message: 'presentationId and transcript are required' });
    }

    let presentation = null;
    if (mongoose.connection.readyState === 1) {
      presentation = await Presentation.findById(presentationId);
    } else {
      presentation = inMemoryStore.findById('presentations', presentationId);
    }

    const slideText = presentation ? (presentation.fullText || JSON.stringify(presentation.slides)) : 'General Presentation Deck';
    const presentationTitle = presentation ? presentation.title : 'Presentation Practice Session';

    // Perform AI analysis
    const aiAnalysis = await analyzePresentationTranscript({
      presentationTitle,
      slideText,
      transcript,
      durationSeconds: parseInt(durationSeconds || 60, 10)
    });

    const reportData = {
      userId,
      presentationId,
      presentationTitle,
      overallScore: aiAnalysis.overallScore,
      scores: aiAnalysis.scores,
      metrics: aiAnalysis.metrics,
      transcript,
      strongAreas: aiAnalysis.strongAreas,
      weakAreas: aiAnalysis.weakAreas,
      suggestions: aiAnalysis.suggestions,
      summary: aiAnalysis.summary
    };

    let createdReport = null;
    if (mongoose.connection.readyState === 1) {
      createdReport = await Report.create(reportData);
    } else {
      createdReport = inMemoryStore.insert('reports', reportData);
    }

    res.status(201).json({
      message: 'Presentation feedback report generated successfully',
      report: createdReport
    });
  } catch (err) {
    console.error('Generate report error:', err);
    res.status(500).json({ message: 'Failed to generate presentation report', error: err.message });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;
    let list = [];

    if (mongoose.connection.readyState === 1) {
      list = await Report.find({ userId }).sort({ createdAt: -1 });
    } else {
      list = inMemoryStore.find('reports', { userId });
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedback reports' });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    let report = null;

    if (mongoose.connection.readyState === 1) {
      report = await Report.findById(id);
    } else {
      report = inMemoryStore.findById('reports', id);
    }

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report details' });
  }
};
