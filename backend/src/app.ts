import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { StatusCodes } from 'http-status-codes';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { videosRouter } from './modules/videos/videos.routes';

export const app = express();

// Security headers first, before anything else touches the request/response.
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Logs every request/response (method, path, status, duration) automatically - one line per
// request, no manual logging calls needed in each route.
app.use(pinoHttp({ logger }));

app.get('/health', (_req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/videos', videosRouter);

// Routes go above this line - anything thrown (or rejected) in them ends up here.
app.use(errorHandler);
