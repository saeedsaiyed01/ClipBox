import { Queue } from 'bullmq';
import { StudioSettings } from '../types/index.js'; // Import .js

// Define the shape of the data our queue will hold
export interface VideoJobData {
  videoPath: string;
  settings: StudioSettings;
}

export interface VideoJobResult {
  finalUrl: string;
}

// Create and export the queue
export const videoQueue = new Queue<VideoJobData, VideoJobResult>('video-processing', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  }
});