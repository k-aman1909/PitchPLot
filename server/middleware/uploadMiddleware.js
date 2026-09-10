import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.pptx', '.ppt'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = (file.mimetype || '').toLowerCase();
  
  const isAllowedExt = allowedExtensions.includes(ext);
  const isAllowedMime = 
    mimetype.includes('pdf') || 
    mimetype.includes('presentation') || 
    mimetype.includes('powerpoint') || 
    mimetype.includes('ms-powerpoint') ||
    mimetype.includes('officedocument') ||
    mimetype.includes('octet-stream');
  
  if (isAllowedExt || isAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error('Only .pdf, .pptx, and .ppt presentation formats are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB limit
  fileFilter
});
