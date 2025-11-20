# Quick Setup Guide - Clipbox

## Current Status Analysis
- ✅ Backend API is running on http://localhost:4000
- ❌ Worker is failing because it's trying to process a non-existent video file
- ❌ Redis queue likely contains stale jobs

## Step 1: Clear Redis Queue (Fix the Error)

The error shows a stale job in the Redis queue. We need to clear it:

### Option A: Use Redis CLI
```bash
# Connect to Redis
redis-cli

# Clear all queues
FLUSHALL

# Exit Redis CLI
exit
```

### Option B: Delete Redis Data File (If using local Redis)
```bash
# Stop Redis first
# Then delete the dump.rdb file
del C:\Users\%USERNAME%\AppData\Local\Redis\dump.rdb
```

### Option C: Restart Redis Container (If using Docker)
```bash
docker stop clipbox-redis
docker rm clipbox-redis
docker run -d -p 6379:6379 --name clipbox-redis redis:alpine
```

## Step 2: Verify Setup

### Check Redis is Running
```bash
redis-cli ping
# Should return: PONG
```

### Check Redis Keys
```bash
redis-cli KEYS "*"
# Should show no clipbox-related keys
```

## Step 3: Test the Application

1. **Start Frontend:**
   ```bash
   cd clipbox-frontend
   npm run dev
   ```

2. **Visit the app:**
   - Open http://localhost:3000 in your browser
   - Upload a video file (MP4 recommended)
   - Click "Export Video"

3. **Expected Flow:**
   - Video uploads to `clipbox-backend/uploads/`
   - Job gets added to Redis queue
   - Worker processes the video with ffmpeg
   - Processed video appears in `clipbox-backend/public/`
   - Frontend shows the final download link

## Step 4: Verify File Structure

After uploads work, you should see:
```
clipbox-backend/
├── uploads/           # Your uploaded videos here
├── public/           # Processed videos appear here
├── src/              # Source code
└── ...
```

## Common Issues & Solutions

### Issue: "ffmpeg not found"
**Solution:** ffmpeg-static should handle this automatically, but if you get this error:
```bash
# Install ffmpeg system-wide or check the error logs
```

### Issue: "Upload directory doesn't exist"
**Solution:** The directories were just created. Try uploading again.

### Issue: "CORS errors"
**Solution:** Make sure frontend is on http://localhost:3000 (CORS is configured for this)

### Issue: Redis connection refused
**Solution:** Ensure Redis is running:
```bash
docker run -d -p 6379:6379 --name clipbox-redis redis:alpine
```

## Testing with Sample Video

To test quickly:
1. Create a small test video or use any MP4 file
2. Upload it through the frontend
3. Monitor the backend terminal for processing logs
4. Check the public/ folder for the output file

## Frontend Testing

The frontend will show these states:
- **"Please select a video file first"** → No file uploaded
- **"Uploading video..."** → File being uploaded
- **"Processing... this may take a moment"** → Job in queue
- **"Your video is ready!"** → Success! Download link appears

## Next Steps

Once the Redis queue is cleared and everything works:
1. Upload a test video through http://localhost:3000
2. Watch the backend terminals for processing logs
3. Download the processed video from the frontend

The application should now work as intended!m 