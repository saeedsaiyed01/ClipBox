import { Job } from 'bullmq';
import { spawn } from 'child_process';
import path from 'path';
import { VideoJobData } from '../queues/video.queue';
import { AspectRatio } from '../types';
import logger from '../utils/logger.js';

// --- HELPER FUNCTIONS ---
const getDimensions = (ratio: AspectRatio): { w: number, h: number } => {
  switch (ratio) {
    case '1:1': return { w: 1080, h: 1080 };
    case '9:16': return { w: 1080, h: 1920 };
    case '4:5': return { w: 1080, h: 1350 };
    case '16:9': default: return { w: 1920, h: 1080 };
  }
};

const parseGradient = (gradient: string): { type: 0 | 1, c0: string, c1: string } => {
  let type: 0 | 1 = 0;
  let c0 = '0x000000';
  let c1 = '0xFFFFFF';
  const colors = gradient.match(/#([0-9a-fA-F]{6})/g);
  if (colors && colors.length >= 2) {
    c0 = `0x${colors[0].substring(1)}`;
    c1 = `0x${colors[1].substring(1)}`;
  } else if (colors && colors.length === 1) {
    c0 = `0x${colors[0].substring(1)}`;
    c1 = `0x${colors[0].substring(1)}`;
  }
  if (gradient.includes('to right')) {
    type = 1;
  }
  return { type, c0, c1 };
};

// --- MAIN PROCESSOR FUNCTION ---
export const processVideoJob = (job: Job<VideoJobData>): Promise<string> => {
  const { videoPath, settings } = job.data;
  const { background, aspectRatio, zoom, borderRadius, position } = settings;

  logger.info(`Processing job with settings`, { jobId: job.id, settings });

  const { w: canvasW, h: canvasH } = getDimensions(aspectRatio);
  const zoomFactor = (zoom || 100) / 100;
  const scaleW = Math.floor(canvasW * zoomFactor / 2) * 2;
  const scaleH = Math.floor(canvasH * zoomFactor / 2) * 2;
  const safeInputPath = path.resolve(videoPath).replace(/\\/g, '/');
  const safeOutputPath = path.resolve('public', `output-${job.id}.mp4`).replace(/\\/g, '/');
  
  const filterComplex: string[] = [];

  // --- Step A: Create the Background ---
  if (background.type === 'solid') {
    filterComplex.push(`color=color=${background.value}:size=${canvasW}x${canvasH}[bg];`);
  } else if (background.type === 'gradient') {
    const { type, c0, c1 } = parseGradient(background.value);
    const x1 = type === 1 ? canvasW : 0;
    const y1 = type === 0 ? canvasH : 0;
    filterComplex.push(`gradients=s=${canvasW}x${canvasH}:c0=${c0}:c1=${c1}:x0=0:y0=0:x1=${x1}:y1=${y1}[bg];`);
  } else {
    filterComplex.push(`color=color=black:size=${canvasW}x${canvasH}[bg];`);
  }

  // --- Step B: Scale the Video ---
  filterComplex.push(
    `[0:v]scale=w=${scaleW}:h=${scaleH}[scaled];`
  );

  let videoStream = '[scaled]';

  // --- Step C: Apply Border Radius (Rounded Corners) ---
  if (borderRadius && borderRadius > 0) {
    logger.info(`Applying border radius`, { jobId: job.id, borderRadius });

    // Create alpha mask for rounded corners
    const r = borderRadius;
    const maskExpr = `geq='255 - ( lt(X,${r}) * lt(Y,${r}) * gt( (X-${r})*(X-${r}) + (Y-${r})*(Y-${r}) , ${r*r} ) + lt(X,${r}) * gt(Y,${scaleH}-${r}) * gt( (X-${r})*(X-${r}) + (Y-(${scaleH}-${r}))*(Y-(${scaleH}-${r})) , ${r*r} ) + gt(X,${scaleW}-${r}) * lt(Y,${r}) * gt( (X-(${scaleW}-${r}))*(X-(${scaleW}-${r})) + (Y-${r})*(Y-${r}) , ${r*r} ) + gt(X,${scaleW}-${r}) * gt(Y,${scaleH}-${r}) * gt( (X-(${scaleW}-${r}))*(X-(${scaleW}-${r})) + (Y-(${scaleH}-${r}))*(Y-(${scaleH}-${r})) , ${r*r} ) ) * 255'`;

    filterComplex.push(`color=color=white:size=${scaleW}x${scaleH},format=rgba,${maskExpr}[mask];`);
    filterComplex.push(`[scaled][mask]alphamerge[final];`);

    videoStream = '[final]';
  }

  // --- Step D: Overlay the video on the background ---
  const overlayX = `(W-w)/2+(${position.x || 0})`;
  const overlayY = `(H-h)/2+(${position.y || 0})`;

  filterComplex.push(
    `[bg]${videoStream}overlay=x=${overlayX}:y=${overlayY}[outv]`
  );

  const ffmpegArgs: string[] = [
    '-i', safeInputPath,
    '-filter_complex', filterComplex.join(''),
    '-map', '[outv]',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    '-t', '30',  // Limit to 30 seconds for testing
    '-y',
    safeOutputPath
  ];

  return new Promise((resolve, reject) => {
    logger.info(`Starting FFmpeg processing`, {
      jobId: job.id,
      input: safeInputPath,
      output: safeOutputPath,
      filter: filterComplex.join(''),
      command: `ffmpeg ${ffmpegArgs.join(' ')}`
    });
    
    let errorLog = '';
    const startTime = Date.now();
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);
    
    let lastLogTime = Date.now();

    ffmpeg.stderr.on('data', (data: Buffer) => {
      const output = data.toString();
      errorLog += output;
      
      // Log progress every 2 seconds
      const now = Date.now();
      if (now - lastLogTime > 2000) {
        const frameMatch = output.match(/frame=\s*(\d+)/);
        const timeMatch = output.match(/time=(\S+)/);
        const fpsMatch = output.match(/fps=\s*(\d+\.?\d*)/);
        if (frameMatch || timeMatch) {
          console.log(
            `[Job ${job.id}] frame=${frameMatch?.[1] || '?'} ` +
            `time=${timeMatch?.[1] || '?'} ` +
            `fps=${fpsMatch?.[1] || '?'}`
          );
          lastLogTime = now;
        }
      }
    });

    ffmpeg.on('close', (code: number) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (code === 0) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
        const finalUrl = `${baseUrl}/output-${job.id}.mp4`;
        logger.info(`Job completed successfully`, { jobId: job.id, duration, finalUrl });
        resolve(finalUrl);
      } else {
        logger.error(`Job failed`, {
          jobId: job.id,
          exitCode: code,
          duration,
          lastOutput: errorLog.slice(-1500)
        });
        reject(new Error(`ffmpeg failed with exit code ${code}`));
      }
    });
    
    ffmpeg.on('error', (err: Error) => {
      logger.error(`Failed to spawn ffmpeg`, { jobId: job.id, error: err.message });
      reject(err);
    });
  });
};