import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { recomputeDailyCounts } from '../../src/modules/aggregation/aggregation.service';
import { AdType, PlaybackEventType } from '../../src/generated/prisma/enums';
import { ApiSuccessMessages } from '../../src/constants/apiSuccessMessages.constants';
import { resetDatabaseBeforeEachTest } from '../setup/resetDatabaseBeforeEachTest';
import { authHeaderFor, createAdPlacement, createVideoWithAdPlacement } from '../helpers/factories';
import { postEvent } from '../helpers/apiRequests';
import {
  TEST_DUPLICATE_BURST_SIZE,
  TEST_OTHER_SESSION_ID,
  TEST_SESSION_ID,
  TestApiPaths,
} from '../helpers/test.constants';

describe('POST /public/events - duplicate events', () => {
  resetDatabaseBeforeEachTest();

  it('records a repeated video event once, answering 201 then 200', async () => {
    const { video } = await createVideoWithAdPlacement();
    const payload = {
      videoId: video.id,
      sessionId: TEST_SESSION_ID,
      eventType: PlaybackEventType.VIDEO_STARTED,
      occurredAt: new Date().toISOString(),
    };

    const first = await postEvent(payload);
    const second = await postEvent(payload);

    expect(first.status).toBe(201);
    expect(first.body.message).toBe(ApiSuccessMessages.PLAYBACK_EVENT_RECORDED);
    expect(second.status).toBe(200);
    expect(second.body.message).toBe(ApiSuccessMessages.PLAYBACK_EVENT_DEDUPED);
    expect(await prisma.playbackEvent.count()).toBe(1);
  });

  it('records a repeated ad event once', async () => {
    const { video, adPlacement } = await createVideoWithAdPlacement();
    const payload = {
      videoId: video.id,
      sessionId: TEST_SESSION_ID,
      eventType: PlaybackEventType.AD_SHOWN,
      occurredAt: new Date().toISOString(),
      adId: adPlacement.id,
    };

    await postEvent(payload).expect(201);
    await postEvent(payload).expect(200);
    await postEvent(payload).expect(200);

    expect(await prisma.playbackEvent.count()).toBe(1);
  });

  it('treats a retry with a re-stamped occurredAt as the same event', async () => {
    const { video } = await createVideoWithAdPlacement();
    const payload = {
      videoId: video.id,
      sessionId: TEST_SESSION_ID,
      eventType: PlaybackEventType.VIDEO_FINISHED,
    };

    await postEvent({ ...payload, occurredAt: new Date().toISOString() }).expect(201);
    await postEvent({ ...payload, occurredAt: new Date(Date.now() + 1000).toISOString() }).expect(
      200,
    );

    expect(await prisma.playbackEvent.count()).toBe(1);
  });

  it('keeps exactly one row when identical events arrive at the same time', async () => {
    const { video, adPlacement } = await createVideoWithAdPlacement();
    const payload = {
      videoId: video.id,
      sessionId: TEST_SESSION_ID,
      eventType: PlaybackEventType.AD_COMPLETED,
      occurredAt: new Date().toISOString(),
      adId: adPlacement.id,
    };

    const responses = await Promise.all(
      Array.from({ length: TEST_DUPLICATE_BURST_SIZE }, () => postEvent(payload)),
    );
    const statuses = responses.map((response) => response.status);

    expect(statuses.filter((status) => status === 201)).toHaveLength(1);
    expect(statuses.filter((status) => status === 200)).toHaveLength(TEST_DUPLICATE_BURST_SIZE - 1);
    expect(await prisma.playbackEvent.count()).toBe(1);
  });

  it('counts a duplicated event once on the dashboard', async () => {
    const { admin, video, adPlacement } = await createVideoWithAdPlacement();
    const payload = {
      videoId: video.id,
      sessionId: TEST_SESSION_ID,
      eventType: PlaybackEventType.AD_SHOWN,
      occurredAt: new Date().toISOString(),
      adId: adPlacement.id,
    };
    await postEvent(payload).expect(201);
    await postEvent(payload).expect(200);

    await recomputeDailyCounts(new Date());
    const today = new Date().toISOString().slice(0, 10);
    const dashboard = await request(app)
      .get(TestApiPaths.dashboard())
      .query({ startDate: today, endDate: today })
      .set('Authorization', authHeaderFor(admin))
      .expect(200);

    expect(dashboard.body.data.impressions).toBe(1);
  });

  describe('distinct events are not mistaken for duplicates', () => {
    it('records the same event from two sessions twice', async () => {
      const { video } = await createVideoWithAdPlacement();
      const payload = {
        videoId: video.id,
        eventType: PlaybackEventType.VIDEO_STARTED,
        occurredAt: new Date().toISOString(),
      };

      await postEvent({ ...payload, sessionId: TEST_SESSION_ID }).expect(201);
      await postEvent({ ...payload, sessionId: TEST_OTHER_SESSION_ID }).expect(201);

      expect(await prisma.playbackEvent.count()).toBe(2);
    });

    it('records different event types in one session separately', async () => {
      const { video, adPlacement } = await createVideoWithAdPlacement();
      const base = {
        videoId: video.id,
        sessionId: TEST_SESSION_ID,
        occurredAt: new Date().toISOString(),
        adId: adPlacement.id,
      };

      await postEvent({ ...base, eventType: PlaybackEventType.AD_SHOWN }).expect(201);
      await postEvent({ ...base, eventType: PlaybackEventType.AD_CLICKED }).expect(201);

      expect(await prisma.playbackEvent.count()).toBe(2);
    });

    it('records the same ad shown at two placements on one video separately', async () => {
      const { admin, video, adPlacement } = await createVideoWithAdPlacement();
      const advertisement = await prisma.advertisement.findFirstOrThrow({
        where: { adminId: admin.id },
      });
      const secondPlacement = await createAdPlacement(video, advertisement, {
        adType: AdType.MID_ROLL,
        startOffsetSeconds: 60,
      });
      const base = {
        videoId: video.id,
        sessionId: TEST_SESSION_ID,
        eventType: PlaybackEventType.AD_SHOWN,
        occurredAt: new Date().toISOString(),
      };

      await postEvent({ ...base, adId: adPlacement.id }).expect(201);
      await postEvent({ ...base, adId: secondPlacement.id }).expect(201);

      expect(await prisma.playbackEvent.count()).toBe(2);
    });
  });
});
