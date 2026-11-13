import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import {
  recomputeDailyCounts,
  runScheduledAggregation,
} from '../../src/modules/aggregation/aggregation.service';
import { AggregationRunStatus, PlaybackEventType } from '../../src/generated/prisma/enums';
import type { AdPlacement, Video } from '../../src/generated/prisma/client.js';
import { ONE_DAY_MS } from '../../src/constants/aggregation.constants';
import { resetDatabaseBeforeEachTest } from '../setup/resetDatabaseBeforeEachTest';
import {
  authHeaderFor,
  createPlaybackEvent,
  createVideoWithAdPlacement,
} from '../helpers/factories';
import {
  TEST_AGGREGATED_DAY,
  TEST_AGGREGATED_DAY_NOON,
  TestApiPaths,
} from '../helpers/test.constants';

/**
 * @description Writes `count` events of one type for a placement (or for the video, without one),
 * each from its own session, at the given time.
 */
const logEvents = (
  video: Video,
  eventType: PlaybackEventType,
  count: number,
  occurredAt: Date,
  adPlacement?: AdPlacement,
) =>
  Promise.all(
    Array.from({ length: count }, () =>
      createPlaybackEvent(video, eventType, { occurredAt, adPlacementId: adPlacement?.id }),
    ),
  );

/**
 * @description The stored count for one placement's event type on the given day, or null if no row
 * was written.
 */
const storedCount = async (adPlacement: AdPlacement, eventType: PlaybackEventType, day: Date) => {
  const row = await prisma.dailyCount.findFirst({
    where: { adPlacementId: adPlacement.id, eventType, eventDate: day },
  });
  return row?.eventCount ?? null;
};

/**
 * @description Noon yesterday (UTC), and yesterday as the date DailyCount stores - a day still
 * inside the scheduler's grace window.
 */
const getYesterday = () => {
  const yesterdayNoon = new Date(Date.now() - ONE_DAY_MS);
  yesterdayNoon.setUTCHours(12, 0, 0, 0);
  return { yesterdayNoon, yesterday: new Date(yesterdayNoon.toISOString().slice(0, 10)) };
};

describe('daily aggregation', () => {
  resetDatabaseBeforeEachTest();

  it('counts one day of raw events per placement and event type', async () => {
    const { video, adPlacement } = await createVideoWithAdPlacement();
    await logEvents(video, PlaybackEventType.AD_SHOWN, 3, TEST_AGGREGATED_DAY_NOON, adPlacement);
    await logEvents(
      video,
      PlaybackEventType.AD_COMPLETED,
      2,
      TEST_AGGREGATED_DAY_NOON,
      adPlacement,
    );
    // The day after - must not leak into TEST_AGGREGATED_DAY's counts.
    await logEvents(
      video,
      PlaybackEventType.AD_SHOWN,
      5,
      new Date(TEST_AGGREGATED_DAY_NOON.getTime() + ONE_DAY_MS),
      adPlacement,
    );

    const run = await recomputeDailyCounts(TEST_AGGREGATED_DAY_NOON);

    const day = new Date(TEST_AGGREGATED_DAY);
    expect(await storedCount(adPlacement, PlaybackEventType.AD_SHOWN, day)).toBe(3);
    expect(await storedCount(adPlacement, PlaybackEventType.AD_COMPLETED, day)).toBe(2);
    expect(run).toMatchObject({ status: AggregationRunStatus.SUCCEEDED, rowsUpserted: 2 });
  });

  it('gives the same counts when a day is re-run, never adding on top', async () => {
    const { video, adPlacement } = await createVideoWithAdPlacement();
    await logEvents(video, PlaybackEventType.AD_SHOWN, 4, TEST_AGGREGATED_DAY_NOON, adPlacement);

    await recomputeDailyCounts(TEST_AGGREGATED_DAY_NOON);
    await recomputeDailyCounts(TEST_AGGREGATED_DAY_NOON);

    expect(
      await storedCount(adPlacement, PlaybackEventType.AD_SHOWN, new Date(TEST_AGGREGATED_DAY)),
    ).toBe(4);
    expect(await prisma.dailyCount.count()).toBe(1);
    // Every run is audited, even one that changed nothing.
    expect(await prisma.aggregationRun.count()).toBe(2);
  });

  it('picks up an event that arrived after the day was counted', async () => {
    const { video, adPlacement } = await createVideoWithAdPlacement();
    const { yesterdayNoon, yesterday } = getYesterday();
    await logEvents(video, PlaybackEventType.AD_SHOWN, 2, yesterdayNoon, adPlacement);
    await recomputeDailyCounts(yesterdayNoon);

    await logEvents(video, PlaybackEventType.AD_SHOWN, 1, yesterdayNoon, adPlacement);
    await runScheduledAggregation();

    expect(await storedCount(adPlacement, PlaybackEventType.AD_SHOWN, yesterday)).toBe(3);
  });

  it('leaves an already-counted day alone when nothing new arrived for it', async () => {
    const { video, adPlacement } = await createVideoWithAdPlacement();
    const { yesterdayNoon, yesterday } = getYesterday();
    await logEvents(video, PlaybackEventType.AD_SHOWN, 2, yesterdayNoon, adPlacement);
    await recomputeDailyCounts(yesterdayNoon);

    await runScheduledAggregation();

    const runsForYesterday = await prisma.aggregationRun.count({ where: { eventDate: yesterday } });
    expect(runsForYesterday).toBe(1);
  });

  it('serves the dashboard from the stored counts, with rates derived from them', async () => {
    const { admin, video, adPlacement } = await createVideoWithAdPlacement();
    await logEvents(video, PlaybackEventType.AD_SHOWN, 4, TEST_AGGREGATED_DAY_NOON, adPlacement);
    await logEvents(
      video,
      PlaybackEventType.AD_COMPLETED,
      2,
      TEST_AGGREGATED_DAY_NOON,
      adPlacement,
    );
    await logEvents(video, PlaybackEventType.AD_CLICKED, 1, TEST_AGGREGATED_DAY_NOON, adPlacement);
    await logEvents(video, PlaybackEventType.VIDEO_STARTED, 4, TEST_AGGREGATED_DAY_NOON);
    await recomputeDailyCounts(TEST_AGGREGATED_DAY_NOON);

    const response = await request(app)
      .get(TestApiPaths.dashboard())
      .query({ startDate: TEST_AGGREGATED_DAY, endDate: TEST_AGGREGATED_DAY })
      .set('Authorization', authHeaderFor(admin))
      .expect(200);

    expect(response.body.data).toMatchObject({
      impressions: 4,
      completions: 2,
      clicks: 1,
      completionRate: 0.5,
      ctr: 0.25,
      videoViews: 4,
    });
    expect(response.body.data.series).toEqual([
      expect.objectContaining({ day: TEST_AGGREGATED_DAY, impressions: 4 }),
    ]);
  });

  it('shows nothing on the dashboard until the day has been aggregated', async () => {
    const { admin, video, adPlacement } = await createVideoWithAdPlacement();
    await logEvents(video, PlaybackEventType.AD_SHOWN, 3, TEST_AGGREGATED_DAY_NOON, adPlacement);

    const response = await request(app)
      .get(TestApiPaths.dashboard())
      .query({ startDate: TEST_AGGREGATED_DAY, endDate: TEST_AGGREGATED_DAY })
      .set('Authorization', authHeaderFor(admin))
      .expect(200);

    expect(response.body.data.impressions).toBe(0);
  });

  it('re-aggregates a chosen day on demand through the admin endpoint', async () => {
    const { admin, video, adPlacement } = await createVideoWithAdPlacement();
    await logEvents(video, PlaybackEventType.AD_SHOWN, 2, TEST_AGGREGATED_DAY_NOON, adPlacement);

    const response = await request(app)
      .post(`${TestApiPaths.aggregation()}/runs`)
      .set('Authorization', authHeaderFor(admin))
      .send({ day: TEST_AGGREGATED_DAY })
      .expect(201);

    expect(response.body.data.aggregationRun.status).toBe(AggregationRunStatus.SUCCEEDED);
    expect(
      await storedCount(adPlacement, PlaybackEventType.AD_SHOWN, new Date(TEST_AGGREGATED_DAY)),
    ).toBe(2);
  });
});
