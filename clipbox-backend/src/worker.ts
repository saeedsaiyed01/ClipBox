import { Job, Worker } from 'bullmq';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { processVideoJob } from './jobs/video.processor.js';
import { VideoJobData } from './queues/video.queue.js';
import logger from './utils/logger.js';
import { ensurePublicDir, ensureUploadsDir } from './utils/paths.js';

ensureUploadsDir();
ensurePublicDir();
// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });
console.log('Loaded CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('Loaded CLOUDINARY_URL:', process.env.CLOUDINARY_URL);

logger.info('Worker is starting...');

const worker = new Worker('video-processing', async (job: Job<VideoJobData>) => {
  logger.info(`Processing job ${job.id}`, { jobId: job.id });
  try {
    const finalUrl = await processVideoJob(job);
    logger.info(`Job ${job.id} completed successfully`, { jobId: job.id, finalUrl });
    return finalUrl;
  } catch (error) {
    logger.error(`Job ${job.id} failed`, { jobId: job.id, error: (error as Error).message });
    throw error;
  }
}, {
  connection: {
    url: process.env.REDIS_URL!
  },
  concurrency: 2
});

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed! URL: ${job.returnvalue}`, {
    jobId: job.id,
    finalUrl: job.returnvalue
  });
});

worker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Job ${job.id} failed: ${err.message}`, {
      jobId: job.id,
      error: err.message,
      stack: err.stack
    });
  } else {
    logger.error('Job failed with no job context', { error: err.message, stack: err.stack });
  }
});