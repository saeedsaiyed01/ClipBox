import { Queue } from 'bullmq';
import cors from 'cors';
import Express from 'express';
import multer from 'multer';

// --- Setup ---
const app = Express();
const PORT = 3000;

// 1. CORS Middleware
// This allows your frontend (on localhost:3000) to talk to this backend
app.use(cors({ origin: 'http://localhost:3000' }));

// 2. JSON & Static Folder Middleware
app.use(Express.json());
// This serves the final videos from the 'public' folder
app.use(Express.static('public'));

// 3. Multer Setup (for file uploads)
// This saves the uploaded video to the 'uploads/' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

// 4. BullMQ Queue Setup
// This connects to Redis (make sure Redis is running!)
const videoQueue = new Queue('video-processing', {
  connection: { host: 'localhost', port: 6379 }
});

// --- API Endpoint ---
app.post('/api/process', upload.single('video'), async (req, res) => {
  console.log('Received file upload request...');

  if (!req.file) {
    return res.status(400).json({ message: 'No video file provided.' });
  }

  const { background } = req.body;
  
  console.log(`Adding job to queue. File: ${req.file.path}`);

  // 5. Add Job to Queue
  // We send the worker the *path* to the uploaded file and the background color
  try {
    const job = await videoQueue.add('process-video', {
      videoPath: req.file.path,
      background: background || '#000000' // Default to black
    });

    // 6. Respond *Immediately*
    // The client doesn't wait for the video to be processed.
    res.json({ 
      message: 'Video is being processed!',
      jobId: job.id 
    });

  } catch (err) {
    console.error('Error adding job to queue:', err);
    res.status(500).json({ message: 'Failed to start processing.' });
  }
});

app.listen(PORT, () => console.log(`Backend API listening on http://localhost:${PORT}`));