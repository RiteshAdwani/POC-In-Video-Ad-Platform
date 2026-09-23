import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { PlaybackEventType } from '../../generated/prisma/enums';
import { dashboardQuerySchema } from './dashboard.schema';

type EventTypeCount = { eventType: PlaybackEventType; _sum: { count: number | null } };

/**
 * @description Pivots a set of DailyCount rows (grouped by eventType, optionally also by day)
 * into the named metrics the dashboard shows. Impressions/completions/skips/clicks come straight
 * from the four ad-scoped event types; completionRate/ctr are derived, guarded against a
 * divide-by-zero when there are no impressions yet (a valid, common state, not an error).
 */
const extractDashboardStats = (rows: EventTypeCount[]) => {
  const sumForEventType = (eventType: PlaybackEventType) =>
    rows.find((row) => row.eventType === eventType)?._sum.count ?? 0;

  const impressions = sumForEventType(PlaybackEventType.AD_SHOWN);
  const completions = sumForEventType(PlaybackEventType.AD_COMPLETED);
  const skips = sumForEventType(PlaybackEventType.AD_SKIPPED);
  const clicks = sumForEventType(PlaybackEventType.AD_CLICKED);
  const videoViews = sumForEventType(PlaybackEventType.VIDEO_STARTED);
  const videoCompletions = sumForEventType(PlaybackEventType.VIDEO_FINISHED);

  return {
    impressions,
    completions,
    skips,
    clicks,
    completionRate: impressions > 0 ? completions / impressions : 0,
    ctr: impressions > 0 ? clicks / impressions : 0,
    videoViews,
    videoCompletions,
  };
};

/**
 * @description Impressions/completion-rate/CTR for a date range, scoped to the caller's own
 * videos and reading only from DailyCount - never PlaybackEvent directly (per
 * in-video-ad-platform.md §3.6). Optionally narrowed to one owned video, and further to one of
 * its placements. Returns the range's totals plus a day-by-day series for trend charting - both
 * come from the same DailyCount rows, just pivoted differently (summed across all days vs. kept
 * per day), so this is one query shape, not two.
 */
export const getDashboardStats: RequestHandler = async (req, res) => {
  const { startDate, endDate, videoId, adPlacementId } = dashboardQuerySchema.parse(req.query);
  const authorId = req.admin!.id;

  if (videoId) {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (video?.authorId !== authorId) {
      throw new NotFoundError(ErrorMessages.VIDEO_NOT_FOUND);
    }
  }

  if (adPlacementId) {
    const adPlacement = await prisma.adPlacement.findUnique({ where: { id: adPlacementId } });
    if (adPlacement?.videoId !== videoId) {
      throw new NotFoundError(ErrorMessages.RESOURCE_NOT_FOUND);
    }
  }

  const scope = {
    day: { gte: startDate, lte: endDate },
    video: { authorId },
    ...(videoId && { videoId }),
    ...(adPlacementId && { adPlacementId }),
  };

  // eventType alone is enough to group by - video-level and ad-level event types never overlap.
  // One row per eventType, summed across every day in the range - the range-wide totals.
  const totalRows = await prisma.dailyCount.groupBy({
    by: ['eventType'],
    where: scope,
    _sum: { count: true },
  });

  // One row per eventType per day (days not summed together) - the per-day trend chart data.
  const dailyRows = await prisma.dailyCount.groupBy({
    by: ['day', 'eventType'],
    where: scope,
    _sum: { count: true },
  });

  // dailyRows is flat - one row per (day, eventType). Bucket it by day so each day's eventType
  // rows end up together, e.g. "2026-09-16" -> [AD_SHOWN row, AD_COMPLETED row, ...].
  const rowsByDay = new Map<string, EventTypeCount[]>();
  for (const row of dailyRows) {
    const key = row.day.toISOString().slice(0, 10);
    const existing = rowsByDay.get(key);
    if (existing) {
      existing.push(row);
    } else {
      rowsByDay.set(key, [row]);
    }
  }

  // Sort chronologically, then pivot each day's bucket into that day's named metrics -
  // one point per day for the trend chart.
  const series = [...rowsByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, rows]) => ({ day, ...extractDashboardStats(rows) }));

  res.status(StatusCodes.OK).json({
    data: { ...extractDashboardStats(totalRows), series },
    message: ApiSuccessMessages.DASHBOARD_STATS_FETCHED,
  });
};
