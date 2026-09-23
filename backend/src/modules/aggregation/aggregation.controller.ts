import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { recomputeDailyCounts } from './aggregation.service';
import { triggerAggregationRunSchema } from './aggregation.schema';

/**
 * @description Manually (re)aggregates one day, bypassing the scheduler's grace-window cutoff -
 * the correction path for a day it's already closed. System-wide, so no per-resource ownership check.
 */
export const triggerAggregationRun: RequestHandler = async (req, res) => {
  const { day } = triggerAggregationRunSchema.parse(req.body);

  const aggregationRun = await recomputeDailyCounts(day);

  res
    .status(StatusCodes.CREATED)
    .json({ data: { aggregationRun }, message: ApiSuccessMessages.AGGREGATION_RUN_TRIGGERED });
};
