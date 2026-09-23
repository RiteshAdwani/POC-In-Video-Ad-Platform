import { logger } from './logger';
import { runScheduledAggregation } from '../modules/aggregation/aggregation.service';
import { AGGREGATION_INTERVAL_MS } from '../constants/aggregation.constants';

/**
 * @description Runs runScheduledAggregation on a fixed interval. Mirrors lib/videoPoller.ts's own overlap guard: if a tick is still
 * running when the next one is due, the next one is skipped rather than started concurrently -
 * this only guards against overlap within this one process; runScheduledAggregation itself is
 * responsible for the DB-level guard (checking AggregationRun for a day that's already RUNNING)
 * that also covers a stuck/crashed previous process.
 */
export const startAggregationScheduler = (): NodeJS.Timeout => {
  let isTickInProgress = false;

  return setInterval(() => {
    if (isTickInProgress) return;
    isTickInProgress = true;

    void runScheduledAggregation()
      .catch((error: unknown) => {
        logger.error(error, 'Scheduled aggregation run failed');
      })
      .finally(() => {
        isTickInProgress = false;
      });
  }, AGGREGATION_INTERVAL_MS);
};
