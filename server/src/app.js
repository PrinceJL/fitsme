import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json());
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);

  // Future phases will mount:
  // app.use('/api/measurements', measurementRoutes);
  // app.use('/api/catalog', catalogRoutes);
  // app.use('/api/recommendations', recommendationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
