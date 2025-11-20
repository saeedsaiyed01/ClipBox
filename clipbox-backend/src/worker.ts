import { Job, Worker } from 'bullmq';
import dotenv from 'dotenv';
import { processVideoJob } from './jobs/video.processor.js';
import { VideoJobData } from './queues/video.queue.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

logger.info('Worker is starting...');

const worker = new Worker('video-processing', async (job: Job<VideoJobData>) => {
  logger.info(`Processing job ${job.id}`, { jobId: job.id });
  try {
    const finalUrl = await processVideoJob(job);
    logger.info(`Job ${job.id} completed successfully`, { jobId: job.id, finalUrl });
    return { finalUrl };
  } catch (error) {
    logger.error(`Job ${job.id} failed`, { jobId: job.id, error: (error as Error).message });
    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  },
  concurrency: 2
});

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed! URL: ${job.returnvalue.finalUrl}`, {
    jobId: job.id,
    finalUrl: job.returnvalue.finalUrl
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