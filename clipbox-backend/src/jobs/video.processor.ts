import { Job } from 'bullmq';
import { spawn } from 'child_process';
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
): Promise<string> => {
  const { videoPath, settings } = job.data;
  const { background, aspectRatio, zoom, borderRadius, position } = settings;

  /* ------------------------------------------------------------------------ */
  /*                       ENSURE REQUIRED DIRECTORIES                         */
  /* ------------------------------------------------------------------------ */

  ensureUploadsDir();
  ensurePublicDir();

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
  const zoomFactor = (zoom ?? 100) / 100;

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
  /*                          BORDER RADIUS MASK                               */
  /* ------------------------------------------------------------------------ */

  if (borderRadius && borderRadius > 0) {
    const r = borderRadius;

    const maskExpr = `geq='255 - (
      lt(X,${r})*lt(Y,${r})*gt((X-${r})*(X-${r})+(Y-${r})*(Y-${r}),${r * r}) +
      lt(X,${r})*gt(Y,${scaleH - r})*gt((X-${r})*(X-${r})+(Y-${scaleH - r})*(Y-${scaleH - r}),${r * r}) +
      gt(X,${scaleW - r})*lt(Y,${r})*gt((X-${scaleW - r})*(X-${scaleW - r})+(Y-${r})*(Y-${r}),${r * r}) +
      gt(X,${scaleW - r})*gt(Y,${scaleH - r})*gt((X-${scaleW - r})*(X-${scaleW - r})+(Y-${scaleH - r})*(Y-${scaleH - r}),${r * r})
    ) * 255'`;

    filters.push(`color=white:size=${scaleW}x${scaleH},format=rgba,${maskExpr}[mask];`);
    filters.push(`[scaled][mask]alphamerge[final];`);

    videoStream = '[final]';
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
    '-filter_complex', filters.join(''),
    '-map', '[outv]',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'copy',
    '-movflags', '+faststart',
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

    ffmpeg.on('close', code => {
      if (code === 0) {
        const baseUrl = process.env.BASE_URL ?? 'http://localhost:10000';
        const finalUrl = `${baseUrl}/public/output-${job.id}.mp4`;

        logger.info('Job completed', { jobId: job.id, finalUrl });
        resolve(finalUrl);
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
