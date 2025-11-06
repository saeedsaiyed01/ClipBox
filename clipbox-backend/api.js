import { Queue } from 'bullmq';
import cors from 'cors';
import Express from 'express';
import multer from 'multer';

// --- Setup ---
const app = Express();
const PORT = 4000;

// 1. CORS Middleware
app.use(cors({ origin: 'http://localhost:3000' }));

// 2. JSON & Static Folder Middleware
app.use(Express.json());
app.use(Express.static('public'));

// 3. Multer Setup (for file uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

// 4. BullMQ Queue Setup
const videoQueue = new Queue('video-processing', {
  connection: { host: 'localhost', port: 6379 } // 'redis' is the service name from docker-compose
});

// --- API Endpoints ---

/**
 * @route   POST /api/process
 * @desc    Uploads a video and adds a processing job to the queue
 */
app.post('/api/process', upload.single('video'), async (req, res) => {
  console.log('Received file upload request...');

  if (!req.file) {
    return res.status(400).json({ message: 'No video file provided.' });
  }

  const { background } = req.body;
  
  console.log(`Adding job to queue. File: ${req.file.path}`);

  try {
    const job = await videoQueue.add('process-video', {
      videoPath: req.file.path,
      background: background || '#000000'
    });

    // Respond *immediately* with the jobId
    res.json({ jobId: job.id });

  } catch (err) {
    console.error('Error adding job to queue:', err);
    res.status(500).json({ message: 'Failed to start processing.' });
  }
});

/**
 * @route   GET /api/status/:jobId
 * @desc    Checks the status of a specific processing job
 */
app.get('/api/status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = await videoQueue.getJob(jobId);

  if (!job) {
    return res.status(404).json({ status: 'not-found' });
  }

  const state = await job.getState();

  // Handle all possible states
  switch (state) {
    case 'completed':
      res.json({ status: 'completed', url: job.returnvalue.finalUrl });
      break;
    case 'failed':
      res.json({ status: 'failed', message: job.failedReason });
      break;
    case 'active':
      res.json({ status: 'processing' });
      break;
    case 'waiting':
      res.json({ status: 'queued' });
      break;
    default:
      res.json({ status: state }); // 'delayed', 'stuck', etc.
  }
});

app.listen(PORT, () => console.log(`Backend API listening on http://localhost:${PORT}`));