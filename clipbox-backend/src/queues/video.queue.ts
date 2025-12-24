import { Queue } from 'bullmq';
import { StudioSettings } from '../types/index.js'; // Import .js

// Define the shape of the data our queue will hold
console.log("video queue started")
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
    url: process.env.REDIS_URL!
  }
});