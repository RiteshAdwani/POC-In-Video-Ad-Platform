import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { triggerAggregationRun } from './aggregation.controller';

export const aggregationRouter = Router();

// The manual re-aggregation entry point (see aggregation.service.ts) - not tied to a single
// admin's own videos, so requireAuth alone is enough; no requireOwnership to apply here.
aggregationRouter.post('/runs', requireAuth, triggerAggregationRun);
