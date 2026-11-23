import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { StatusCodes } from 'http-status-codes';
import { env } from './config/env';
import { logger } from './lib/logger';
import { getRequestId } from './lib/requestContext';
import { errorHandler } from './middleware/errorHandler';
import { requestContext } from './middleware/requestContext';
import { requireAuth } from './middleware/requireAuth';
import { authenticatedApiRateLimiter } from './middleware/rateLimit';
import { authRouter } from './modules/auth/auth.routes';
import { videosRouter } from './modules/videos/videos.routes';
import { advertisementsRouter } from './modules/advertisements/advertisements.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { aggregationRouter } from './modules/aggregation/aggregation.routes';
import { publicRouter } from './modules/public/public.routes';

export const app = express();

// How many reverse proxies sit in front of the app - req.ip (which the rate limiters count by) is
// read from X-Forwarded-For only that many hops deep, so a client can't fake its own IP.
app.set('trust proxy', env.TRUST_PROXY);

// First of all, so every log line and error response for this request carries its id.
app.use(requestContext);
// Security headers next, before anything else touches the request/response.
app.use(helmet());
// credentials: the player records events with navigator.sendBeacon, which always sends in
// credentials mode - without this header the browser drops every cross-origin beacon. Auth is a
// Bearer token, not a cookie, so allowing credentials exposes no session to other sites.
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Logs every request/response (method, path, status, duration) automatically - one line per
// request, no manual logging calls needed in each route.
// genReqId: the access log's req.id is the same request id as everywhere else.
app.use(pinoHttp({ logger, genReqId: (req) => getRequestId() ?? req.id }));

app.get('/health', (_req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok' });
});

// Every private route needs a logged-in user, and is rate limited per user rather than per IP.
const authenticatedRouteMiddleware = [requireAuth, authenticatedApiRateLimiter];

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/videos', authenticatedRouteMiddleware, videosRouter);
app.use('/api/v1/advertisements', authenticatedRouteMiddleware, advertisementsRouter);
app.use('/api/v1/dashboard', authenticatedRouteMiddleware, dashboardRouter);
app.use('/api/v1/aggregation', authenticatedRouteMiddleware, aggregationRouter);
app.use('/api/v1/public', publicRouter);

// Routes go above this line - anything thrown (or rejected) in them ends up here.
app.use(errorHandler);
