import { Router } from 'express';
import multer from 'multer';
import { getJobStatus, processVideo } from '../../../controllers/process.controller.js';
import logger from '../../utils/logger.js';

const router = Router();

// --- File Upload Configuration ---
// A helper function to remove spaces and special characters from filenames
const sanitizeFilename = (filename: string) => {
  return filename.replace(/[\s()]/g, '-').replace(/-+/g, '-');
};

// Multer setup with file size limits and validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize the original name before saving
    const safeName = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '100000000', 10); // 100MB default

const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter: (req, file, cb) => {
    // Basic validation: only video files
    if (!file.mimetype.startsWith('video/')) {
      logger.warn('Rejected non-video file upload', { mimetype: file.mimetype, filename: file.originalname });
      cb(new Error('Only video files are allowed'));
      return;
    }
    cb(null, true);
  }
});

// Define the routes
router.post('/process', upload.single('video'), processVideo);
router.get('/status/:jobId', getJobStatus);

export default router;