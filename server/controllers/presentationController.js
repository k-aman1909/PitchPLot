import Presentation from '../models/Presentation.js';
import { parsePresentationFile } from '../services/fileParserService.js';
import { convertPptToPdf } from '../services/pptToPdfService.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

export const uploadPresentation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please select a PDF or PPTX file.' });
    }

    const { originalname, filename, size, path: filePath } = req.file;
    const userId = req.user.id;
    const ext = path.extname(originalname).toLowerCase().replace('.', '');
    const fileType = ext === 'pdf' ? 'pdf' : (ext === 'ppt' ? 'ppt' : 'pptx');

    // Parse presentation slides data (for AI analysis and Viva viva engine)
    const parsedData = await parsePresentationFile(filePath, originalname);

    // Generate high-fidelity visual PDF for PPT/PPTX (or use original PDF)
    let pdfUrl = fileType === 'pdf' ? `/uploads/${filename}` : '';
    if (fileType !== 'pdf') {
      try {
        const convertedPdfUrl = await convertPptToPdf(filePath, 'uploads');
        if (convertedPdfUrl) {
          pdfUrl = convertedPdfUrl;
        }
      } catch (convErr) {
        console.warn('PPTX conversion warning (falling back to native storage):', convErr.message);
      }
    }

    const title = req.body.title || originalname.replace(/\.[^/.]+$/, "");
    const category = req.body.category || 'General Pitch';

    const presentationData = {
      userId,
      title,
      fileUrl: `/uploads/${filename}`,
      pdfUrl,
      fileName: originalname,
      fileType,
      fileSize: size,
      slideCount: parsedData.slideCount,
      slides: parsedData.slides,
      fullText: parsedData.fullText,
      category
    };

    let createdPresentation = null;

    if (mongoose.connection.readyState === 1) {
      createdPresentation = await Presentation.create(presentationData);
    } else {
      createdPresentation = inMemoryStore.insert('presentations', presentationData);
    }

    res.status(201).json({
      message: 'Presentation uploaded and parsed successfully',
      presentation: createdPresentation
    });
  } catch (err) {
    console.error('Upload presentation error:', err);
    res.status(500).json({ message: 'Failed to upload and parse presentation file', error: err.message });
  }
};

export const getUserPresentations = async (req, res) => {
  try {
    const userId = req.user.id;
    let list = [];

    if (mongoose.connection.readyState === 1) {
      list = await Presentation.find({ userId }).sort({ createdAt: -1 });
      if (!list || list.length === 0) {
        list = await Presentation.find().sort({ createdAt: -1 }).limit(10);
      }
    } else {
      list = inMemoryStore.find('presentations', { userId });
      if (!list || list.length === 0) {
        list = inMemoryStore.getCollection('presentations') || [];
      }
      list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch presentations' });
  }
};

export const getPresentationById = async (req, res) => {
  try {
    const { id } = req.params;
    let presentation = null;

    if (mongoose.connection.readyState === 1) {
      presentation = await Presentation.findById(id);
    } else {
      presentation = inMemoryStore.findById('presentations', id);
    }

    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }

    // Auto-resolve missing visual PDF for existing PPT/PPTX presentations
    if (presentation.fileType !== 'pdf' && (!presentation.pdfUrl || presentation.pdfUrl.endsWith('.pptx') || presentation.pdfUrl.endsWith('.ppt'))) {
      const localFileName = path.basename(presentation.fileUrl);
      const diskPath = path.resolve(process.cwd(), 'uploads', localFileName);
      if (fs.existsSync(diskPath)) {
        try {
          const converted = await convertPptToPdf(diskPath, 'uploads');
          if (converted) {
            presentation.pdfUrl = converted;
            if (mongoose.connection.readyState === 1) {
              await Presentation.updateOne({ _id: presentation._id }, { pdfUrl: converted });
            } else {
              inMemoryStore.update('presentations', { _id: presentation._id }, { pdfUrl: converted });
            }
          }
        } catch (e) {}
      }
    }

    res.json(presentation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve presentation' });
  }
};

export const deletePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let presentation = null;
    if (mongoose.connection.readyState === 1) {
      presentation = await Presentation.findOne({ _id: id, userId });
      if (presentation) {
        await Presentation.deleteOne({ _id: id, userId });
      }
    } else {
      presentation = inMemoryStore.findById('presentations', id);
      if (presentation) {
        inMemoryStore.delete('presentations', id);
      }
    }

    // Try deleting physical uploaded file and converted PDF from uploads folder to save disk space
    if (presentation) {
      const filesToDelete = [presentation.fileUrl, presentation.pdfUrl].filter(Boolean);
      for (const fileItem of filesToDelete) {
        try {
          const localFileName = path.basename(fileItem);
          const diskPath = path.resolve(process.cwd(), 'uploads', localFileName);
          if (fs.existsSync(diskPath)) {
            fs.unlinkSync(diskPath);
          }
        } catch (fileErr) {
          console.warn('File deletion notice:', fileErr.message);
        }
      }
    }

    res.json({ message: 'Presentation deck deleted successfully' });
  } catch (err) {
    console.error('Delete presentation error:', err);
    res.status(500).json({ message: 'Failed to delete presentation' });
  }
};
