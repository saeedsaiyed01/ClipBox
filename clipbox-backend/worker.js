import { Worker } from 'bullmq';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';

console.log('Worker is starting...');

// --- ffmpeg Helper Function ---
// This is an improved version of our Phase 1 script, wrapped in a Promise
function processVideo(jobData) {
  const { videoPath, background } = jobData;
  
  // Save the output to the 'public' folder so it can be served by the API
  const outputFilename = path.join('public', `output-${job.id}.mp4`);

  const outputWidth = 1080;
  const outputHeight = 1080;

  const ffmpegArgs = [
    '-i', videoPath,
    '-vf', [
      `scale=${outputWidth}:${outputHeight}:force_original_aspect_ratio=decrease`,
      `pad=${outputWidth}:${outputHeight}:(ow-iw)/2:(oh-ih)/2:color=${background}`
    ].join(','),
    '-c:a', 'copy',
    '-y', // Overwrite output file if it exists
    outputFilename
  ];

  return new Promise((resolve, reject) => {
    console.log(`Worker: Starting ffmpeg for job ${job.id}`);
    
    const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

    ffmpeg.stderr.on('data', (data) => {
      console.log(`ffmpeg (job ${job.id}): ${data}`);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`Worker: Finished processing job ${job.id}`);
        // We return the *URL* to the file, not the path
        resolve(`http://localhost:4000/output-${job.id}.mp4`);
      } else {
        console.error(`Worker: ffmpeg process exited with code ${code} for job ${job.id}`);
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
    
    ffmpeg.on('error', (err) => {
      console.error(`Worker: Failed to start ffmpeg for job ${job.id}`, err);
      reject(err);
    });
  });
}

// --- BullMQ Worker ---
const worker = new Worker('video-processing', async (job) => {
  // This is where the job is handled
  const finalUrl = await processVideo(job);
  return { finalUrl }; // This result gets saved to the job
}, {
  connection: { host: 'localhost', port: 6379 }
});

worker.on('completed', (job) => console.log(`Job ${job.id} completed! URL: ${job.returnvalue.finalUrl}`));
worker.on('failed', (job, err) => console.log(`Job ${job.id} failed: ${err.message}`));