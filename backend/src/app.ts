import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import { env } from './config/env';

export const app = express();

// Security headers first, before anything else touches the request/response.
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok' });
});
