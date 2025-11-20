import { Worker } from 'bullmq';
import { processVideoJob } from './src/jobs/video.processor.js';

console.log('Worker is starting...');

const worker = new Worker('video-processing', async (job) => {
  const finalUrl = await processVideoJob(job);
  return { finalUrl };
}, {
  connection: {
    host: 'localhost',
    port: 6379
  },
  concurrency: 2
});

worker.on('completed', (job) => console.log(`Job ${job.id} completed! URL: ${job.returnvalue.finalUrl}`));
// worker.on('failed', (job, err) => console.log(`Job ${job.id} failed: ${err.message}`));