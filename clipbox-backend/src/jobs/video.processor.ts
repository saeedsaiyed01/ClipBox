import { Job } from 'bullmq';
import { spawn } from 'child_process';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

import { VideoJobData } from '../queues/video.queue.js';
import { AspectRatio } from '../types';
import logger from '../utils/logger.js';
import {
  PUBLIC_DIR,
  UPLOADS_DIR,
  ensurePublicDir,
  ensureUploadsDir
} from '../utils/paths.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* -------------------------------------------------------------------------- */
/*                               HELPER UTILS                                  */
/* -------------------------------------------------------------------------- */

const getDimensions = (ratio: AspectRatio): { w: number; h: number } => {
  switch (ratio) {
    case '1:1':
      return { w: 1080, h: 1080 };
    case '9:16':
      return { w: 1080, h: 1920 };
    case '4:5':
      return { w: 1080, h: 1350 };
    case '16:9':
    default:
      return { w: 1920, h: 1080 };
  }
};

const parseGradient = (gradient: string) => {
  const colors = gradient.match(/#([0-9a-fA-F]{6})/g) || ['#000000', '#ffffff'];
  const c0 = `0x${colors[0].replace('#', '')}`;
  const c1 = `0x${colors[1]?.replace('#', '') || colors[0].replace('#', '')}`;
  const horizontal = gradient.includes('to right');

  return { c0, c1, horizontal };
};

/* -------------------------------------------------------------------------- */
/*                              MAIN PROCESSOR                                 */
/* -------------------------------------------------------------------------- */

export const processVideoJob = async (
  job: Job<VideoJobData>
): Promise<{ finalUrl: string }> => {
  const { videoPath, settings } = job.data;
  const { background, aspectRatio, zoom, borderRadius, position } = settings;

  /* ------------------------------------------------------------------------ */
  /*                       ENSURE REQUIRED DIRECTORIES                         */
  /* ------------------------------------------------------------------------ */

  console.log('VIDEO PROCESSOR: Ensuring directories...');
  ensureUploadsDir();
  ensurePublicDir();
  console.log('VIDEO PROCESSOR: Directories ensured');

  const inputPath = path.join(UPLOADS_DIR, path.basename(videoPath));
  const outputPath = path.join(PUBLIC_DIR, `output-${job.id}.mp4`);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input video not found: ${inputPath}`);
  }

  logger.info('Starting video processing', {
    jobId: job.id,
    inputPath,
    outputPath
  });

  // For Render's free tier, disable complex video processing to prevent memory issues
  // Just do basic scaling and encoding without backgrounds or effects

  const { w: canvasW, h: canvasH } = getDimensions(aspectRatio);
  const zoomFactor = Math.min((zoom ?? 100) / 100, 1.0); // Limit zoom to prevent memory issues

  const scaleW = Math.floor((canvasW * zoomFactor) / 2) * 2;
  const scaleH = Math.floor((canvasH * zoomFactor) / 2) * 2;

  // Simple filter: just scale the video
  const filters: string[] = [
    `scale=${scaleW}:${scaleH}`
  ];

  /* ------------------------------------------------------------------------ */
  /*                             FFMPEG ARGS                                  */
  /* ------------------------------------------------------------------------ */

  const ffmpegArgs = [
    '-i', inputPath,
    '-vf', filters.join(','),  // Simple filter, not complex
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    '-t', '30',  // Limit to 30 seconds
    '-y',
    outputPath
  ];

  logger.info('FFmpeg command', {
    jobId: job.id,
    command: `ffmpeg ${ffmpegArgs.join(' ')}`
  });

  /* ------------------------------------------------------------------------ */
  /*                              EXECUTION                                   */
  /* ------------------------------------------------------------------------ */

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);
    let stderr = '';

    ffmpeg.stderr.on('data', d => (stderr += d.toString()));

    ffmpeg.on('close', async code => {
      if (code === 0) {
        try {
          // Upload to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(outputPath, {
            resource_type: 'video',
            folder: 'clipbox/outputs',
            public_id: `output-${job.id}`
          });

          // Delete local file to save memory
          fs.unlinkSync(outputPath);

          const finalUrl = uploadResult.secure_url;

          logger.info('Job completed and uploaded to Cloudinary', {
            jobId: job.id,
            finalUrl,
            cloudinaryPublicId: uploadResult.public_id
          });

          resolve({ finalUrl });
        } catch (uploadError) {
          logger.error('Cloudinary upload failed', {
            jobId: job.id,
            error: (uploadError as Error).message
          });

          // Clean up local file even if upload fails
          try {
            fs.unlinkSync(outputPath);
          } catch (cleanupError) {
            logger.warn('Failed to cleanup local file', { jobId: job.id, error: (cleanupError as Error).message });
          }

          reject(new Error(`Cloudinary upload failed: ${(uploadError as Error).message}`));
        }
      } else {
        logger.error('FFmpeg failed', {
          jobId: job.id,
          exitCode: code,
          stderr: stderr.slice(-2000)
        });
        reject(new Error(`ffmpeg failed with exit code ${code}`));
      }
    });

    ffmpeg.on('error', err => {
      logger.error('FFmpeg spawn failed', { jobId: job.id, error: err.message });
      reject(err);
    });
  });
};
