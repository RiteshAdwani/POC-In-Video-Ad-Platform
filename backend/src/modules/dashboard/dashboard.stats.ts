import { PlaybackEventType } from '../../generated/prisma/enums';

export type EventTypeCount = { eventType: PlaybackEventType; _sum: { eventCount: number | null } };

/**
 * @description Pivots a set of DailyCount rows (grouped by eventType, optionally also by day)
 * into the named metrics the dashboard shows. Impressions/completions/skips/clicks come straight
 * from the four ad-scoped event types; the rate fields are derived, each guarded against a
 * divide-by-zero when its denominator is 0 (a valid, common state, not an error). A pure function
 * with no Prisma or env import, so it's unit-testable on its own.
 */
export const extractDashboardStats = (rows: EventTypeCount[]) => {
  const sumForEventType = (eventType: PlaybackEventType) =>
    rows.find((row) => row.eventType === eventType)?._sum.eventCount ?? 0;

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
    skipRate: impressions > 0 ? skips / impressions : 0,
    ctr: impressions > 0 ? clicks / impressions : 0,
    videoViews,
    videoCompletions,
    videoCompletionRate: videoViews > 0 ? videoCompletions / videoViews : 0,
  };
};
