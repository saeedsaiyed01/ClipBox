import { Job } from 'bullmq';
import { createCanvas } from 'canvas';
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

/* -------------------------------------------------------------------------- */
/*                                HELPERS                                     */
/* -------------------------------------------------------------------------- */

const getDimensions = (ratio: AspectRatio) => {
  switch (ratio) {
    case '1:1': return { w: 1080, h: 1080 };
    case '9:16': return { w: 1080, h: 1920 };
    case '4:5': return { w: 1080, h: 1350 };
    default: return { w: 1920, h: 1080 };
  }
};

const parseGradient = (gradient: string) => {
  const colors = gradient.match(/#([0-9a-fA-F]{6})/g) || ['#000000', '#ffffff'];
  const c0 = colors[0].replace('#', '');
  const c1 = colors[1]?.replace('#', '') || c0;
  const horizontal = gradient.includes('to right');
  return { c0, c1, horizontal };
};

const generateRoundedMask = (
  width: number,
  height: number,
  radius: number,
  outputPath: string
) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(width - radius, 0);
  ctx.quadraticCurveTo(width, 0, width, radius);
  ctx.lineTo(width, height - radius);
  ctx.quadraticCurveTo(width, height, width - radius, height);
  ctx.lineTo(radius, height);
  ctx.quadraticCurveTo(0, height, 0, height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
};

/* -------------------------------------------------------------------------- */
/*                              MAIN PROCESSOR                                 */
/* -------------------------------------------------------------------------- */

export const processVideoJob = async (
  job: Job<VideoJobData>
): Promise<string> => {

  const { videoPath, settings } = job.data;
  const { background, aspectRatio, zoom, borderRadius, position } = settings;

  ensureUploadsDir();
  ensurePublicDir();

  const inputPath = path.join(UPLOADS_DIR, path.basename(videoPath));
  const outputPath = path.join(PUBLIC_DIR, `output-${job.id}.mp4`);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input video not found: ${inputPath}`);
  }

  const { w: canvasW, h: canvasH } = getDimensions(aspectRatio);
  const zoomFactor = Math.min((zoom ?? 100) / 100, 1);
  const scaleW = Math.floor((canvasW * zoomFactor) / 2) * 2;
  const scaleH = Math.floor((canvasH * zoomFactor) / 2) * 2;

  const offsetX = position?.x ?? 0;
  const offsetY = position?.y ?? 0;

  const overlayX = offsetX === 0 ? '(W-w)/2' : `(W-w)/2+${offsetX}`;
  const overlayY = offsetY === 0 ? '(H-h)/2' : `(H-h)/2+${offsetY}`;

  const filters: string[] = [];

  /* ----------------------------- BACKGROUND ----------------------------- */

  if (background.type === 'solid') {
    filters.push(`color=color=${background.value}:size=${canvasW}x${canvasH}[bg]`);
  } else if (background.type === 'gradient') {
    const { c0, c1, horizontal } = parseGradient(background.value);
    const x1 = horizontal ? canvasW : 0;
    const y1 = horizontal ? 0 : canvasH;
    filters.push(
      `gradients=s=${canvasW}x${canvasH}:c0=${c0}:c1=${c1}:x0=0:y0=0:x1=${x1}:y1=${y1}[bg]`
    );
  } else {
    filters.push(`color=color=black:size=${canvasW}x${canvasH}[bg]`);
  }

  /* ----------------------------- VIDEO SCALE ----------------------------- */

  filters.push(`[0:v]scale=${scaleW}:${scaleH}[scaled]`);

  let outputStream = '[composite]';
  let maskPath: string | null = null;

  /* --------------------------- BORDER RADIUS --------------------------- */

  if (borderRadius && borderRadius > 0) {
    const radius = Math.min(borderRadius, Math.floor(Math.min(scaleW, scaleH) / 2));
    maskPath = path.join(PUBLIC_DIR, `mask-${job.id}.png`);
    generateRoundedMask(scaleW, scaleH, radius, maskPath);

    filters.push(`[scaled]format=yuva420p[video_alpha]`);
    filters.push(`[1:v]scale=${scaleW}:${scaleH}[mask]`);
    filters.push(`[video_alpha][mask]alphamerge[rounded_video]`);
    filters.push(`[bg][rounded_video]overlay=${overlayX}:${overlayY}[final]`);
    outputStream = '[final]';
  } else {
    filters.push(`[bg][scaled]overlay=${overlayX}:${overlayY}[composite]`);
  }

  /* ----------------------------- FFMPEG ----------------------------- */

  const ffmpegArgs = ['-i', inputPath];

  if (maskPath) {
    ffmpegArgs.push('-i', maskPath);
  }

  ffmpegArgs.push(
    '-filter_complex', filters.join(';'),
    '-map', outputStream,
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    '-t', '30',
    '-y',
    outputPath
  );

  logger.info('FFmpeg command', {
    jobId: job.id,
    command: `ffmpeg ${ffmpegArgs.join(' ')}`
  });

  /* ----------------------------- EXECUTION ----------------------------- */

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);
    let stderr = '';

    ffmpeg.stderr.on('data', d => (stderr += d.toString()));

    ffmpeg.on('close', async code => {
      if (maskPath && fs.existsSync(maskPath)) fs.unlinkSync(maskPath);

      if (code !== 0) {
        logger.error('FFmpeg failed', { jobId: job.id, stderr });
        return reject(new Error('ffmpeg failed'));
      }

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const upload = await cloudinary.uploader.upload(outputPath, {
        resource_type: 'video',
        folder: 'clipbox/outputs',
        public_id: `output-${job.id}`,
        overwrite: true
      });

      fs.unlinkSync(outputPath);
      resolve(upload.secure_url);
    });
  });
};
