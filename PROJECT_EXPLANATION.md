# 📚 Clipbox - Complete Project Explanation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Frontend Explained](#frontend-explained)
4. [Backend Explained](#backend-explained)
5. [Video Processing Pipeline](#video-processing-pipeline)
6. [Border Radius Implementation](#border-radius-implementation)
7. [Data Flow](#data-flow)
8. [Key Technologies](#key-technologies)

---

## Project Overview

**Clipbox** is a web-based video editor that allows users to:
- Upload videos
- Add custom backgrounds (solid colors, gradients, images)
- Adjust aspect ratio (16:9, 1:1, 9:16, 4:5)
- Apply rounded corners (border radius)
- Zoom in/out
- Position the video
- Download the processed video

**Think of it like Canva, but for videos.**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Next.js Frontend (Port 3000)                   │ │
│  │  - Upload video                                        │ │
│  │  - Preview with CSS (instant)                          │ │
│  │  - Adjust settings (background, radius, zoom)          │ │
│  │  - Click "Process" button                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST /api/process
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express API Server (Port 4000)            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Receive video file + settings                      │ │
│  │  2. Save video to uploads/ folder                      │ │
│  │  3. Create job in Redis queue                          │ │
│  │  4. Return job ID to frontend                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Job added to queue
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Redis (BullMQ Queue)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Job Queue: [job1, job2, job3, ...]                    │ │
│  │  - Stores pending jobs                                 │ │
│  │  - Tracks job status (queued → processing → completed) │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Worker picks up job
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Worker Process (Separate)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Pick job from queue                                │ │
│  │  2. Generate mask image (if border radius)             │ │
│  │  3. Run FFmpeg to process video                        │ │
│  │  4. Upload result to Cloudinary                        │ │
│  │  5. Update job status to "completed"                   │ │
│  │  6. Clean up temporary files                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Video URL returned
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         Cloudinary CDN                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  - Stores processed videos                             │ │
│  │  - Provides fast CDN delivery                          │ │
│  │  - Returns public URL                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Frontend polls for status
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  - Poll /api/status/:jobId every 3 seconds            │ │
│  │  - When completed, show download button                │ │
│  │  - User downloads video from Cloudinary URL            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Explained

### File Structure
```
clipbox-frontend/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── studio/page.tsx             # Main editor page
│   ├── components/
│   │   ├── Studio.tsx              # Main editor logic
│   │   ├── PreviewWindow.tsx       # Video preview with CSS
│   │   ├── SettingsPanel.tsx       # Border radius, zoom controls
│   │   ├── BackgroundPanel.tsx     # Background color/gradient/image
│   │   ├── LayoutPanel.tsx         # Aspect ratio selector
│   │   └── UploadDropzone.tsx      # Drag & drop upload
│   └── lib/
│       └── api.ts                  # API calls to backend
```

### How Frontend Works

#### 1. **Studio.tsx** - The Brain
```typescript
// This is the main component that holds ALL the state

const [file, setFile] = useState<File | null>(null);  // Uploaded video file
const [settings, setSettings] = useState({
  background: { type: 'solid', value: '#1E293B' },
  aspectRatio: '16:9',
  borderRadius: 24,  // ← This is what we fixed!
  zoom: 100,
  position: { x: 0, y: 0 }
});
const [status, setStatus] = useState('idle');  // idle → uploading → processing → completed
const [jobId, setJobId] = useState(null);
const [downloadUrl, setDownloadUrl] = useState(null);
```

**Why this structure?**
- All state in one place = easier to manage
- Child components just receive props and call callbacks
- Single source of truth

#### 2. **PreviewWindow.tsx** - CSS Magic
```typescript
// Shows instant preview using CSS (no video processing yet)

<div style={{ borderRadius: `${borderRadius}px` }}>
  <video src={videoPreviewUrl} />
</div>
```

**Why CSS preview?**
- Instant feedback (no waiting)
- User sees exactly what they'll get
- CSS is fast, video processing is slow

#### 3. **Upload & Process Flow**
```typescript
// 1. User uploads video
const handleUpload = (file) => {
  setFile(file);
  setVideoPreviewUrl(URL.createObjectURL(file));  // Show preview immediately
};

// 2. User clicks "Process"
const handleProcess = async () => {
  setStatus('uploading');
  
  // Send to backend
  const result = await startProcessing(file, settings);
  
  setJobId(result.jobId);
  setStatus('processing');
  
  // Start polling for status
  pollJobStatus(result.jobId);
};

// 3. Poll every 3 seconds
const pollJobStatus = async (jobId) => {
  const interval = setInterval(async () => {
    const status = await checkJobStatus(jobId);
    
    if (status === 'completed') {
      setDownloadUrl(status.url);
      setStatus('completed');
      clearInterval(interval);
    }
  }, 3000);
};
```

---

## Backend Explained

### File Structure
```
clipbox-backend/
├── src/
│   ├── server.ts                   # Express API server
│   ├── worker.ts                   # BullMQ worker
│   ├── jobs/
│   │   └── video.processor.ts      # FFmpeg video processing
│   ├── queues/
│   │   └── video.queue.ts          # Job queue setup
│   └── utils/
│       ├── logger.ts               # Winston logging
│       └── paths.ts                # Directory management
├── uploads/                        # Temporary uploaded videos
└── public/                         # Temporary processed videos
```

### How Backend Works

#### 1. **server.ts** - API Server
```typescript
// Express server that receives requests

app.post('/api/process', upload.single('video'), async (req, res) => {
  // 1. Receive video file
  const videoFile = req.file;  // Multer saves it to uploads/
  const settings = JSON.parse(req.body.settings);
  
  // 2. Create job in queue
  const job = await videoQueue.add('process-video', {
    videoPath: videoFile.path,
    settings: settings
  });
  
  // 3. Return job ID immediately (don't wait for processing)
  res.json({ jobId: job.id });
});

app.get('/api/status/:jobId', async (req, res) => {
  // Check job status in Redis
  const job = await videoQueue.getJob(req.params.jobId);
  
  if (job.isCompleted()) {
    res.json({ 
      status: 'completed', 
      url: job.returnvalue  // Cloudinary URL
    });
  } else if (job.isFailed()) {
    res.json({ status: 'failed', message: job.failedReason });
  } else {
    res.json({ status: 'processing' });
  }
});
```

**Why use a queue?**
- Video processing takes 10-60 seconds
- Can't keep HTTP connection open that long
- Queue allows async processing
- Can handle multiple jobs in parallel

#### 2. **worker.ts** - Job Processor
```typescript
// Separate process that picks up jobs from queue

const worker = new Worker('video-queue', async (job) => {
  // This runs in the background
  const result = await processVideoJob(job);
  return result;  // Cloudinary URL
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

**Why separate worker?**
- API server stays responsive
- Worker can crash without affecting API
- Can scale workers independently
- Better resource management

---

## Video Processing Pipeline

### video.processor.ts - The Core Logic

```typescript
export const processVideoJob = async (job) => {
  const { videoPath, settings } = job.data;
  const { background, aspectRatio, zoom, borderRadius, position } = settings;
  
  // STEP 1: Calculate dimensions
  const { w: canvasW, h: canvasH } = getDimensions(aspectRatio);
  // 16:9 → 1920x1080, 1:1 → 1080x1080, etc.
  
  const scaleW = Math.floor((canvasW * zoom / 100) / 2) * 2;
  const scaleH = Math.floor((canvasH * zoom / 100) / 2) * 2;
  // Must be even numbers for FFmpeg
  
  // STEP 2: Build FFmpeg filter chain
  const filters = [];
  
  // 2a. Create background
  if (background.type === 'solid') {
    filters.push(`color=color=${background.value}:size=${canvasW}x${canvasH}[bg];`);
    // Creates a solid color canvas
  } else if (background.type === 'gradient') {
    const { c0, c1, horizontal } = parseGradient(background.value);
    filters.push(`gradients=s=${canvasW}x${canvasH}:c0=${c0}:c1=${c1}[bg];`);
    // Creates a gradient canvas
  }
  
  // 2b. Scale video
  filters.push(`[0:v]scale=${scaleW}:${scaleH}[scaled];`);
  // [0:v] = first input video
  // scale to calculated dimensions
  // output to [scaled] stream
  
  // 2c. Apply border radius (if enabled)
  let maskPath = null;
  if (borderRadius > 0) {
    // Generate mask image using Canvas
    maskPath = path.join(PUBLIC_DIR, `mask-${job.id}.png`);
    generateRoundedMask(scaleW, scaleH, borderRadius, maskPath);
    
    // Apply mask to video
    filters.push(`[scaled]format=yuva420p[video_alpha];`);
    // Add alpha channel to video
    
    filters.push(`[1:v]scale=${scaleW}:${scaleH}[mask];`);
    // [1:v] = second input (mask image)
    // Scale mask to match video size
    
    filters.push(`[video_alpha][mask]alphamerge[rounded_video];`);
    // Merge video with mask
    // White areas of mask = visible
    // Black areas of mask = transparent
    
    // Overlay rounded video on background
    filters.push(`[bg][rounded_video]overlay=(W-w)/2:(H-h)/2[final];`);
    // (W-w)/2 = center horizontally
    // (H-h)/2 = center vertically
  } else {
    // No border radius - simple overlay
    filters.push(`[bg][scaled]overlay=(W-w)/2:(H-h)/2[composite];`);
  }
  
  // STEP 3: Build FFmpeg command
  const ffmpegArgs = [
    '-i', videoPath,           // Input 1: video
  ];
  
  if (maskPath) {
    ffmpegArgs.push('-i', maskPath);  // Input 2: mask (if border radius)
  }
  
  ffmpegArgs.push(
    '-filter_complex', filters.join(''),  // Apply all filters
    '-map', outputStream,                  // Use final output stream
    '-map', '0:a?',                        // Copy audio (if exists)
    '-c:v', 'libx264',                     // H.264 codec
    '-preset', 'ultrafast',                // Fast encoding
    '-crf', '28',                          // Quality (lower = better)
    '-pix_fmt', 'yuv420p',                 // Color format (compatible)
    '-c:a', 'copy',                        // Copy audio without re-encoding
    '-movflags', '+faststart',             // Web-optimized
    '-t', '30',                            // Limit to 30 seconds
    '-y',                                  // Overwrite output
    outputPath
  );
  
  // STEP 4: Execute FFmpeg
  const ffmpeg = spawn('ffmpeg', ffmpegArgs);
  
  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg failed with code ${code}`));
    });
  });
  
  // STEP 5: Upload to Cloudinary
  const uploadResult = await cloudinary.uploader.upload(outputPath, {
    resource_type: 'video',
    folder: 'clipbox/outputs'
  });
  
  // STEP 6: Clean up
  fs.unlinkSync(outputPath);  // Delete local file
  if (maskPath) fs.unlinkSync(maskPath);  // Delete mask
  
  // STEP 7: Return Cloudinary URL
  return uploadResult.secure_url;
};
```

---

## Border Radius Implementation

### The Problem
FFmpeg can't easily create smooth rounded corners because:
1. Alpha channels get corrupted when encoding to yuv420p
2. The `geq` filter causes color space issues
3. The `drawbox` filter only creates rectangles, not curves

### The Solution

#### Step 1: Generate Mask with Canvas
```typescript
const generateRoundedMask = (width, height, radius, outputPath) => {
  // Create a canvas (in-memory image)
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill with black (= transparent areas)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
  
  // Draw white rounded rectangle (= visible area)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(radius, 0);                                    // Top-left corner
  ctx.lineTo(width - radius, 0);                            // Top edge
  ctx.quadraticCurveTo(width, 0, width, radius);            // Top-right curve
  ctx.lineTo(width, height - radius);                       // Right edge
  ctx.quadraticCurveTo(width, height, width - radius, height);  // Bottom-right curve
  ctx.lineTo(radius, height);                               // Bottom edge
  ctx.quadraticCurveTo(0, height, 0, height - radius);      // Bottom-left curve
  ctx.lineTo(0, radius);                                    // Left edge
  ctx.quadraticCurveTo(0, 0, radius, 0);                    // Top-left curve
  ctx.closePath();
  ctx.fill();
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
};
```

**Result:** A PNG image that looks like this:
```
┌─────────────────────────┐
│ ╭─────────────────────╮ │  ← White (visible)
│ │                     │ │
│ │     WHITE AREA      │ │
│ │                     │ │
│ ╰─────────────────────╯ │
└─────────────────────────┘
   ↑ Black (transparent)
```

#### Step 2: Apply Mask with FFmpeg
```bash
ffmpeg \
  -i video.mp4 \           # Input 1: video
  -i mask.png \            # Input 2: mask
  -filter_complex "
    [0:v]scale=1304:734[scaled];              # Scale video
    [scaled]format=yuva420p[video_alpha];     # Add alpha channel
    [1:v]scale=1304:734[mask];                # Scale mask to match
    [video_alpha][mask]alphamerge[rounded];   # Apply mask
    [bg][rounded]overlay=(W-w)/2:(H-h)/2      # Overlay on background
  " \
  output.mp4
```

**How alphamerge works:**
- Takes video with alpha channel + mask image
- Where mask is WHITE (255) → video is VISIBLE
- Where mask is BLACK (0) → video is TRANSPARENT
- Creates smooth rounded corners!

#### Step 3: Why This Works
1. **Canvas draws perfect curves** - No FFmpeg filter limitations
2. **Mask is applied before encoding** - No alpha channel corruption
3. **Transparent areas show background** - Natural blending
4. **Cross-platform compatible** - Works on Windows, Mac, Linux

---

## Data Flow

### Complete Request Flow

```
1. USER UPLOADS VIDEO
   ↓
   Frontend: File → createObjectURL() → Preview
   ↓
   Frontend: FormData with file + settings
   ↓
   
2. API RECEIVES REQUEST
   ↓
   Backend: Multer saves file to uploads/
   ↓
   Backend: Create job in Redis queue
   ↓
   Backend: Return { jobId: "123" }
   ↓
   
3. FRONTEND STARTS POLLING
   ↓
   Every 3 seconds: GET /api/status/123
   ↓
   
4. WORKER PICKS UP JOB
   ↓
   Worker: Get job from Redis
   ↓
   Worker: Generate mask (if border radius)
   ↓
   Worker: Run FFmpeg
   ↓
   Worker: Upload to Cloudinary
   ↓
   Worker: Update job status to "completed"
   ↓
   Worker: Clean up temp files
   ↓
   
5. FRONTEND GETS RESULT
   ↓
   Poll response: { status: "completed", url: "https://..." }
   ↓
   Frontend: Show download button
   ↓
   User: Click download → Opens Cloudinary URL
```

---

## Key Technologies

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web server
- **TypeScript** - Type safety
- **BullMQ** - Job queue (uses Redis)
- **Redis** - In-memory database for queue
- **Multer** - File upload handling
- **FFmpeg** - Video processing
- **Canvas** - Image generation (for masks)
- **Cloudinary** - Video hosting CDN
- **Winston** - Logging

### Why These Choices?

**BullMQ + Redis:**
- Reliable job queue
- Handles failures gracefully
- Can retry failed jobs
- Scales horizontally

**FFmpeg:**
- Industry standard for video processing
- Extremely powerful and flexible
- Free and open source
- Supports all video formats

**Cloudinary:**
- Fast CDN delivery
- Automatic video optimization
- No need to manage storage
- Reliable and scalable

**Canvas:**
- Can generate images programmatically
- Perfect for creating masks
- Fast and lightweight
- Works in Node.js

---

## Common Questions

### Q: Why not process video in the browser?
**A:** Video processing is CPU-intensive and would:
- Freeze the browser
- Take much longer
- Use lots of memory
- Not work on mobile devices

### Q: Why use a queue instead of processing immediately?
**A:** Because:
- Video processing takes 10-60 seconds
- HTTP requests timeout after 30 seconds
- Queue allows async processing
- Better user experience (no waiting)

### Q: Why upload to Cloudinary instead of serving directly?
**A:** Because:
- CDN is faster than our server
- Automatic video optimization
- No storage management needed
- Scales automatically

### Q: Why separate API server and worker?
**A:** Because:
- API stays responsive
- Worker can crash without affecting API
- Can scale independently
- Better resource isolation

### Q: Why Canvas for mask generation?
**A:** Because:
- FFmpeg can't easily draw smooth curves
- Canvas is perfect for 2D graphics
- Fast and lightweight
- Generates perfect rounded rectangles

---

## Performance Considerations

### Video Processing Time
- **Small video (< 10MB):** ~10-15 seconds
- **Medium video (10-50MB):** ~20-30 seconds
- **Large video (> 50MB):** ~40-60 seconds

### Optimizations
1. **Limit video length** - Max 30 seconds
2. **Fast preset** - `ultrafast` encoding
3. **Reasonable quality** - CRF 28 (good balance)
4. **Parallel processing** - Multiple workers
5. **Cleanup** - Delete temp files immediately

### Scaling
- **Horizontal:** Add more worker processes
- **Vertical:** Increase server resources
- **Queue:** Redis can handle millions of jobs
- **CDN:** Cloudinary scales automatically

---

## Error Handling

### Frontend
```typescript
try {
  const result = await startProcessing(file, settings);
  setJobId(result.jobId);
} catch (error) {
  setError('Upload failed. Please try again.');
  setStatus('idle');
}
```

### Backend
```typescript
worker.on('failed', (job, err) => {
  logger.error('Job failed', { jobId: job.id, error: err.message });
  // Job automatically retries 3 times
});
```

### FFmpeg
```typescript
ffmpeg.on('close', (code) => {
  if (code !== 0) {
    // Log stderr for debugging
    logger.error('FFmpeg failed', { stderr: stderr.slice(-2000) });
    reject(new Error(`FFmpeg failed with code ${code}`));
  }
});
```

---

## Security Considerations

1. **File Upload Limits**
   - Max file size: 100MB
   - Allowed types: video/mp4, video/quicktime, video/webm

2. **Input Validation**
   - Validate all settings (borderRadius, zoom, etc.)
   - Sanitize file names
   - Check file types

3. **Resource Limits**
   - Max video length: 30 seconds
   - Max concurrent jobs: 5
   - Timeout: 5 minutes per job

4. **Cleanup**
   - Delete uploaded files after processing
   - Delete temp files immediately
   - Clear old jobs from Redis

---

## Deployment

### Environment Variables
```env
# Backend
PORT=4000
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### Running Locally
```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Backend API
cd clipbox-backend
npm run dev

# Terminal 3: Start Worker
cd clipbox-backend
npm run worker

# Terminal 4: Start Frontend
cd clipbox-frontend
npm run dev
```

### Production Deployment
1. **Frontend:** Deploy to Vercel/Netlify
2. **Backend API:** Deploy to Railway/Render
3. **Worker:** Deploy to Railway/Render (separate service)
4. **Redis:** Use Redis Cloud or Upstash

---

## Summary

**Clipbox is a video editor that:**
1. Lets users upload videos and customize them
2. Shows instant CSS preview
3. Processes videos in the background using FFmpeg
4. Applies effects like rounded corners, backgrounds, zoom
5. Uploads results to Cloudinary CDN
6. Returns download link to user

**The border radius fix:**
- Uses Canvas to generate a mask image
- Applies mask with FFmpeg's alphamerge filter
- Avoids alpha channel corruption issues
- Creates smooth, professional rounded corners

**Key insight:** Sometimes the best solution is combining multiple tools (Canvas + FFmpeg) rather than forcing one tool to do everything!

---

## Need More Details?

If you want deeper explanations of any specific part:
- FFmpeg filter syntax
- BullMQ job queue internals
- Canvas drawing API
- React state management
- TypeScript types
- Cloudinary API

Just ask! 🚀
