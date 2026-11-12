import { describe, expect, it } from 'vitest';
import { extractDashboardStats } from '../../src/modules/dashboard/dashboard.stats';
import type { EventTypeCount } from '../../src/modules/dashboard/dashboard.stats';
import { PlaybackEventType } from '../../src/generated/prisma/enums';

const row = (eventType: PlaybackEventType, count: number | null): EventTypeCount => ({
  eventType,
  _sum: { eventCount: count },
});

describe('extractDashboardStats', () => {
  it('sums each event type into its named field', () => {
    const stats = extractDashboardStats([
      row(PlaybackEventType.AD_SHOWN, 100),
      row(PlaybackEventType.AD_COMPLETED, 40),
      row(PlaybackEventType.AD_SKIPPED, 20),
      row(PlaybackEventType.AD_CLICKED, 5),
      row(PlaybackEventType.VIDEO_STARTED, 50),
      row(PlaybackEventType.VIDEO_FINISHED, 30),
    ]);

    expect(stats.impressions).toBe(100);
    expect(stats.completions).toBe(40);
    expect(stats.skips).toBe(20);
    expect(stats.clicks).toBe(5);
    expect(stats.videoViews).toBe(50);
    expect(stats.videoCompletions).toBe(30);
  });

  it('derives rates as a fraction of impressions/videoViews', () => {
    const stats = extractDashboardStats([
      row(PlaybackEventType.AD_SHOWN, 100),
      row(PlaybackEventType.AD_COMPLETED, 40),
      row(PlaybackEventType.AD_SKIPPED, 20),
      row(PlaybackEventType.AD_CLICKED, 5),
      row(PlaybackEventType.VIDEO_STARTED, 50),
      row(PlaybackEventType.VIDEO_FINISHED, 25),
    ]);

    expect(stats.completionRate).toBeCloseTo(0.4);
    expect(stats.skipRate).toBeCloseTo(0.2);
    expect(stats.ctr).toBeCloseTo(0.05);
    expect(stats.videoCompletionRate).toBeCloseTo(0.5);
  });

  it('treats a missing event type as zero, not an error', () => {
    const stats = extractDashboardStats([]);

    expect(stats.impressions).toBe(0);
    expect(stats.completions).toBe(0);
    expect(stats.skips).toBe(0);
    expect(stats.clicks).toBe(0);
    expect(stats.videoViews).toBe(0);
    expect(stats.videoCompletions).toBe(0);
  });

  it('guards every rate against divide-by-zero when its denominator is 0', () => {
    const stats = extractDashboardStats([]);

    expect(stats.completionRate).toBe(0);
    expect(stats.skipRate).toBe(0);
    expect(stats.ctr).toBe(0);
    expect(stats.videoCompletionRate).toBe(0);
  });

  it('treats a null _sum.eventCount (Prisma aggregate with no matching rows) as zero', () => {
    const stats = extractDashboardStats([
      row(PlaybackEventType.AD_SHOWN, null),
      row(PlaybackEventType.VIDEO_STARTED, null),
    ]);

    expect(stats.impressions).toBe(0);
    expect(stats.videoViews).toBe(0);
    expect(stats.completionRate).toBe(0);
  });
});
