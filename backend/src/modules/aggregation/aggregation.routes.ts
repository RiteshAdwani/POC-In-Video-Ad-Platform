import { Router } from 'express';
import { aggregationRateLimiter } from '../../middleware/rateLimit';
import { triggerAggregationRun } from './aggregation.controller';

export const aggregationRouter = Router();

// The manual re-aggregation entry point (see aggregation.service.ts) - not tied to a single
// admin's own videos, so login alone is enough; no requireOwnership to apply here.
aggregationRouter.post('/runs', aggregationRateLimiter, triggerAggregationRun);
