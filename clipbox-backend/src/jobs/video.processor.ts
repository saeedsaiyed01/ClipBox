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

// Configure Cloudinary using CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ CLOUDINARY_URL: process.env.CLOUDINARY_URL });
} else {
  // Fallback to individual variables if CLOUDINARY_URL not set
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

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

  const { w: canvasW, h: canvasH } = getDimensions(aspectRatio);
  const zoomFactor = Math.min((zoom ?? 100) / 100, 1.0); // Limit zoom to prevent memory issues

  const scaleW = Math.floor((canvasW * zoomFactor) / 2) * 2;
  const scaleH = Math.floor((canvasH * zoomFactor) / 2) * 2;

  const filters: string[] = [];

  /* ------------------------------------------------------------------------ */
  /*                              BACKGROUND                                  */
  /* ------------------------------------------------------------------------ */

  if (background.type === 'solid') {
    filters.push(`color=color=${background.value}:size=${canvasW}x${canvasH}[bg];`);
  } else if (background.type === 'gradient') {
    const { c0, c1, horizontal } = parseGradient(background.value);
    const x1 = horizontal ? canvasW : 0;
    const y1 = horizontal ? 0 : canvasH;
    filters.push(
      `gradients=s=${canvasW}x${canvasH}:c0=${c0}:c1=${c1}:x0=0:y0=0:x1=${x1}:y1=${y1}[bg];`
    );
  } else {
    filters.push(`color=color=black:size=${canvasW}x${canvasH}[bg];`);
  }

  /* ------------------------------------------------------------------------ */
  /*                             SCALE VIDEO                                  */
  /* ------------------------------------------------------------------------ */

  filters.push(`[0:v]scale=${scaleW}:${scaleH}[scaled];`);

  let videoStream = '[scaled]';

  /* ------------------------------------------------------------------------ */
  /*                          SIMPLE BORDER RADIUS                             */
  /* ------------------------------------------------------------------------ */

  if (borderRadius && borderRadius > 0) {
    // Very simple border radius: just crop slightly to create rounded effect
    const cropMargin = Math.min(borderRadius, 10); // Limit to prevent memory issues
    const cropW = Math.max(scaleW - cropMargin * 2, scaleW * 0.95);
    const cropH = Math.max(scaleH - cropMargin * 2, scaleH * 0.95);

    filters.push(`[scaled]crop=${cropW}:${cropH}:(iw-ow)/2:(ih-oh)/2[rounded];`);
    videoStream = '[rounded]';
  }

  /* ------------------------------------------------------------------------ */
  /*                               OVERLAY                                    */
  /* ------------------------------------------------------------------------ */

  const overlayX = `(W-w)/2+(${position?.x ?? 0})`;
  const overlayY = `(H-h)/2+(${position?.y ?? 0})`;

  filters.push(`[bg]${videoStream}overlay=${overlayX}:${overlayY}[outv]`);

  /* ------------------------------------------------------------------------ */
  /*                             FFMPEG ARGS                                  */
  /* ------------------------------------------------------------------------ */

  const ffmpegArgs = [
    '-i', inputPath,
    '-filter_complex', filters.join(''),  // Complex filter for background/overlay
    '-map', '[outv]',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    '-t', '30',  // Limit to 30 seconds
    '-max_muxing_queue_size', '1024',  // Memory limit
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
          logger.info('Starting Cloudinary upload', { jobId: job.id, outputPath });

          // Upload to Cloudinary with video resource type
          const uploadResult = await cloudinary.uploader.upload(outputPath, {
            resource_type: 'video',
            folder: 'clipbox/outputs',
            public_id: `output-${job.id}`,
            use_filename: false,
            unique_filename: false
          });

          // Delete local file to save memory
          fs.unlinkSync(outputPath);

          const finalUrl = uploadResult.secure_url;

          logger.info('Job completed and uploaded to Cloudinary', {
            jobId: job.id,
            finalUrl,
            cloudinaryPublicId: uploadResult.public_id,
            bytes: uploadResult.bytes
          });

          // Return only the Cloudinary secure URL
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
