import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { startVideoPoller } from './lib/videoPoller';
import { startAggregationScheduler } from './lib/aggregationScheduler';

const server = app.listen(env.PORT, () => {
  logger.info(`Backend listening on port ${env.PORT} (${env.NODE_ENV})`);
});

const pollerHandle = startVideoPoller();
const aggregationSchedulerHandle = startAggregationScheduler();

// SIGTERM is what Docker/Render send when stopping a container (not a hard kill) - this lets
// in-flight requests finish and closes the Postgres pool cleanly instead of abandoning it.
const shutdown = (signal: string): void => {
  logger.info(`${signal} received, shutting down gracefully`);
  clearInterval(pollerHandle);
  clearInterval(aggregationSchedulerHandle);
  server.close(() => {
    prisma
      .$disconnect()
      .catch((err: unknown) => logger.error(err, 'Error disconnecting Prisma'))
      .finally(() => process.exit(0));
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
