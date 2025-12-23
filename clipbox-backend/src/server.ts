import cors from 'cors';
import dotenv from 'dotenv';
import Express, { Application, NextFunction, Request, Response } from 'express';
import { errorHandler } from './../middleware/errorHandler.js';
import processRoutes from './api/routes/process.routes.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const app: Application = Express();
const PORT: number = parseInt(process.env.PORT || '4000', 10);

// --- Middleware ---
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' || 'https://clip-box-fe.vercel.app' }));
app.use(Express.json());
app.use(Express.static(process.env.PUBLIC_DIR || 'public'));
app.use('/api/uploads', Express.static(process.env.UPLOAD_DIR || 'uploads'));

// --- Health Check Endpoint ---
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'clipbox-backend',
    version: '1.0.0'
  });
});

// --- Routes ---
app.use('/api', processRoutes);

// --- Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack, url: req.url });
  errorHandler(err, req, res, next);
});

app.listen(PORT, () => {
  logger.info(`Backend API listening on port ${PORT}`, { port: PORT, env: process.env.NODE_ENV });
});