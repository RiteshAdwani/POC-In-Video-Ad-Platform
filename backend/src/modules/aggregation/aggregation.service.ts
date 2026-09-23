import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { AggregationRunStatus } from '../../generated/prisma/enums';
import { Prisma, type AggregationRun } from '../../generated/prisma/client.js';
import { AGGREGATION_GRACE_WINDOW_HOURS, ONE_DAY_MS } from '../../constants/aggregation.constants';

/** Normalizes any Date to midnight UTC of its calendar day - the bucketing rule for `day`. */
const toUtcDayStart = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

/**
 * @description Recomputes every DailyCount row for one day from the raw PlaybackEvent log, from
 * scratch (never an increment) - safe to call repeatedly. Unconditional: doesn't check the grace
 * window itself, so the manual re-aggregation endpoint can call it directly on any day.
 */
export const recomputeDailyCounts = async (day: Date): Promise<AggregationRun> => {
  // Snap to this day's midnight-to-midnight UTC range - the [dayStart, dayEnd) window everything
  // below filters and writes against.
  const dayStart = toUtcDayStart(day);
  const dayEnd = new Date(dayStart.getTime() + ONE_DAY_MS);

  // Audit row first, marked RUNNING - so even a crash before this function returns leaves a
  // visible trace of the attempt.
  const run = await prisma.aggregationRun.create({
    data: { day: dayStart, status: AggregationRunStatus.RUNNING },
  });

  try {
    // The actual recount: every raw event in this day, bucketed by (video, placement, type).
    const groups = await prisma.playbackEvent.groupBy({
      by: ['videoId', 'adPlacementId', 'eventType'],
      where: { occurredAt: { gte: dayStart, lt: dayEnd } },
      _count: { _all: true },
    });

    // find-then-create-or-update, not .upsert(): Prisma's upsert() can't target DailyCount's
    // partial unique indexes (fails with 42P10). Each write commits independently, not in one
    // transaction, so a mid-run read may mix old/new values across rows, but never within a row.
    for (const group of groups) {
      const count = group._count._all;
      // DailyCount has two compound keys - pick whichever matches this group's shape.
      const where = group.adPlacementId
        ? {
            videoId_adPlacementId_eventType_day: {
              videoId: group.videoId,
              adPlacementId: group.adPlacementId,
              eventType: group.eventType,
              day: dayStart,
            },
          }
        : {
            videoId_eventType_day: {
              videoId: group.videoId,
              eventType: group.eventType,
              day: dayStart,
            },
          };

      // Already aggregated before - just overwrite the count, nothing else to do for this group.
      const existing = await prisma.dailyCount.findUnique({ where });
      if (existing) {
        await prisma.dailyCount.update({ where: { id: existing.id }, data: { count } });
        continue;
      }

      // First time this combination is ever aggregated - create its row.
      try {
        await prisma.dailyCount.create({
          data: {
            videoId: group.videoId,
            adPlacementId: group.adPlacementId,
            eventType: group.eventType,
            day: dayStart,
            count,
          },
        });
      } catch (error) {
        // Another concurrent run created it first between our findUnique and create - fall back
        // to updating the row it won.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          const raceWinner = await prisma.dailyCount.findUniqueOrThrow({ where });
          await prisma.dailyCount.update({ where: { id: raceWinner.id }, data: { count } });
          continue;
        }
        throw error;
      }
    }

    // Every group wrote successfully - close out the audit row.
    return await prisma.aggregationRun.update({
      where: { id: run.id },
      data: {
        status: AggregationRunStatus.SUCCEEDED,
        completedAt: new Date(),
        rowsUpserted: groups.length,
      },
    });
  } catch (error) {
    // Something above threw - record the failure on the same audit row, then propagate so the
    // caller (scheduler tick or manual trigger) knows this day did not succeed.
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(error, `Aggregation run ${run.id} failed for day ${dayStart.toISOString()}`);
    await prisma.aggregationRun.update({
      where: { id: run.id },
      data: { status: AggregationRunStatus.FAILED, completedAt: new Date(), error: message },
    });
    throw error;
  }
};

/**
 * @description Scheduler entry point - picks which day(s) need (re)aggregation this tick (always
 * today, plus any grace-window day with a late-arriving event since its last successful run) and
 * recomputes each. Never touches a day older than the grace window.
 */
export const runScheduledAggregation = async (): Promise<void> => {
  const now = new Date();
  const today = toUtcDayStart(now);
  // Oldest day still eligible for auto re-aggregation - anything before this is closed.
  const graceWindowStart = toUtcDayStart(
    new Date(now.getTime() - AGGREGATION_GRACE_WINDOW_HOURS * 60 * 60 * 1000),
  );

  // Today is always recomputed - it's still accumulating events, so it's expected to be
  // stale-until-next-run.
  const daysToProcess: Date[] = [today];

  // Walk every earlier day in the grace window and decide, one by one, whether it needs a redo.
  for (let day = graceWindowStart; day < today; day = new Date(day.getTime() + ONE_DAY_MS)) {
    const dayEnd = new Date(day.getTime() + ONE_DAY_MS);

    const lastRun = await prisma.aggregationRun.findFirst({
      where: { day, status: AggregationRunStatus.SUCCEEDED },
      orderBy: { startedAt: 'desc' },
    });

    if (!lastRun) {
      // Never successfully aggregated within the window yet - needs a first pass.
      daysToProcess.push(day);
      continue;
    }

    // Did any event for this day arrive after we last finished counting it?
    const lateEvent = await prisma.playbackEvent.findFirst({
      where: {
        occurredAt: { gte: day, lt: dayEnd },
        receivedAt: { gt: lastRun.completedAt ?? lastRun.startedAt },
      },
      select: { id: true },
    });

    if (lateEvent) {
      // A late arrival means this day's stored counts are now stale - redo it.
      daysToProcess.push(day);
    }
  }

  // to-do list is final - now actually recompute each day on it.
  for (const day of daysToProcess) {
    await recomputeDailyCounts(day);
  }
};
