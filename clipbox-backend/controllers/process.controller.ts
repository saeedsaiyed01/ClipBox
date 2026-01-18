import { Job } from 'bullmq';
import { NextFunction, Request, Response } from 'express';
import { videoQueue } from '../src/queues/video.queue.js';
import { StudioSettings } from '../src/types';
import logger from '../src/utils/logger.js';

// Controller for POST /api/process
export const processVideo = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Received file upload request', { ip: req.ip, userAgent: req.get('User-Agent') });

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Video generation limit is now handled by checkCredits middleware


    // Validation
    if (!req.file) {
      logger.warn('Upload attempt without file');
      throw new Error('No video file provided.');
    }

    if (!req.body.settings) {
      logger.warn('Upload attempt without settings', { file: req.file.originalname });
      throw new Error('No settings provided.');
    }

    // Parse and validate settings
    let settings: StudioSettings;
    try {
      settings = JSON.parse(req.body.settings);
    } catch (parseError) {
      logger.warn('Invalid JSON in settings', { settings: req.body.settings });
      throw new Error('Invalid settings format.');
    }

    // Basic validation of settings
    if (!settings.aspectRatio || !settings.background) {
      logger.warn('Missing required settings fields', { settings });
      throw new Error('Missing required settings fields.');
    }

    logger.info('Adding job to queue', {
      file: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      settings: settings
    });

    // Add the job with the correct data shape
    const job = await videoQueue.add('process-video', {
      videoPath: req.file.path,
      settings: settings
    });

    // Increment videoGenerationsCount and save user
    req.user.videoGenerationsCount += 1;
    await req.user.save();

    logger.info('Job added to queue', { jobId: job.id });
    res.json({ jobId: job.id });

  } catch (err) {
    logger.error('Error in processVideo controller', { error: (err as Error).message });
    next(err as Error);
  }
};

// Controller for GET /api/status/:jobId
export const getJobStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;

    // Basic validation
    if (!jobId || typeof jobId !== 'string') {
      logger.warn('Invalid jobId in status request', { jobId });
      return res.status(400).json({ status: 'error', message: 'Invalid job ID' });
    }

    const job: Job | undefined = await videoQueue.getJob(jobId);

    if (!job) {
      logger.warn('Job not found', { jobId });
      return res.status(404).json({ status: 'not-found' });
    }

    const state = await job.getState();
    logger.info('Job status requested', { jobId, state });

    switch (state) {
      case 'completed':
        res.json({ status: 'completed', url: job.returnvalue });
        break;
      case 'failed':
        logger.error('Failed job status requested', { jobId, failedReason: job.failedReason });
        res.json({ status: 'failed', message: job.failedReason });
        break;
      case 'active':
        res.json({ status: 'processing' });
        break;
      default:
        res.json({ status: state });
    }
  } catch (err) {
    logger.error('Error in getJobStatus controller', { error: (err as Error).message, jobId: req.params.jobId });
    next(err as Error);
  }
};