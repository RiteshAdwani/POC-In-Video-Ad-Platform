import { describe, expect, it } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { AdType, PlaybackEventType, VideoStatus } from '../../src/generated/prisma/enums';
import { ErrorMessages } from '../../src/constants/errorMessages.constants';
import { resetDatabaseBeforeEachTest } from '../setup/resetDatabaseBeforeEachTest';
import {
  createAdmin,
  createAdPlacement,
  createAdvertisement,
  createVideo,
} from '../helpers/factories';
import { postEvent } from '../helpers/apiRequests';
import { TEST_SESSION_ID, TEST_UNKNOWN_ID } from '../helpers/test.constants';

/**
 * @description An ad event for this video and placement, from one session, happening now.
 */
const adEvent = (videoId: string, adId: string, eventType: PlaybackEventType) => ({
  videoId,
  adId,
  eventType,
  sessionId: TEST_SESSION_ID,
  occurredAt: new Date().toISOString(),
});

describe('POST /public/events - ingestion', () => {
  resetDatabaseBeforeEachTest();

  describe('out-of-order delivery', () => {
    it('accepts an ad completion that arrives before its ad shown', async () => {
      const admin = await createAdmin();
      const video = await createVideo(admin);
      const adPlacement = await createAdPlacement(video, await createAdvertisement(admin));

      await postEvent(adEvent(video.id, adPlacement.id, PlaybackEventType.AD_COMPLETED)).expect(
        201,
      );
      await postEvent(adEvent(video.id, adPlacement.id, PlaybackEventType.AD_SHOWN)).expect(201);

      const eventTypes = (
        await prisma.playbackEvent.findMany({ orderBy: { receivedAt: 'asc' } })
      ).map((event) => event.eventType);
      expect(eventTypes).toEqual([PlaybackEventType.AD_COMPLETED, PlaybackEventType.AD_SHOWN]);
    });
  });

  describe('rejected events are never stored', () => {
    it('rejects a malformed payload with per-field errors', async () => {
      const response = await postEvent({ videoId: 'not-a-uuid', eventType: 'NOT_AN_EVENT' });

      expect(response.status).toBe(400);
      const fields = response.body.errors.map((error: { field: string }) => error.field);
      expect(fields).toEqual(expect.arrayContaining(['videoId', 'eventType', 'sessionId']));
      expect(await prisma.playbackEvent.count()).toBe(0);
    });

    it('rejects an ad event that names no ad', async () => {
      const video = await createVideo(await createAdmin());

      const response = await postEvent({
        videoId: video.id,
        sessionId: TEST_SESSION_ID,
        eventType: PlaybackEventType.AD_SHOWN,
        occurredAt: new Date().toISOString(),
      });

      expect(response.status).toBe(400);
      expect(await prisma.playbackEvent.count()).toBe(0);
    });

    it('rejects an event for a video that does not exist', async () => {
      const response = await postEvent({
        videoId: TEST_UNKNOWN_ID,
        sessionId: TEST_SESSION_ID,
        eventType: PlaybackEventType.VIDEO_STARTED,
        occurredAt: new Date().toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ErrorMessages.VIDEO_NOT_FOUND);
    });

    it('rejects an event for a deleted video', async () => {
      const video = await createVideo(await createAdmin(), { deletedAt: new Date() });

      const response = await postEvent({
        videoId: video.id,
        sessionId: TEST_SESSION_ID,
        eventType: PlaybackEventType.VIDEO_STARTED,
        occurredAt: new Date().toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ErrorMessages.VIDEO_NOT_FOUND);
    });

    it('rejects an event for a video that is still processing', async () => {
      const video = await createVideo(await createAdmin(), {
        status: VideoStatus.PROCESSING,
        playbackUrl: null,
      });

      const response = await postEvent({
        videoId: video.id,
        sessionId: TEST_SESSION_ID,
        eventType: PlaybackEventType.VIDEO_STARTED,
        occurredAt: new Date().toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ErrorMessages.VIDEO_NOT_READY);
      expect(await prisma.playbackEvent.count()).toBe(0);
    });

    it('rejects an ad event whose placement belongs to another video', async () => {
      const admin = await createAdmin();
      const video = await createVideo(admin);
      const otherVideo = await createVideo(admin);
      const otherPlacement = await createAdPlacement(otherVideo, await createAdvertisement(admin));

      const response = await postEvent(
        adEvent(video.id, otherPlacement.id, PlaybackEventType.AD_SHOWN),
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ErrorMessages.INVALID_AD_REFERENCE);
      expect(await prisma.playbackEvent.count()).toBe(0);
    });

    it('rejects an ad event for a removed placement', async () => {
      const admin = await createAdmin();
      const video = await createVideo(admin);
      const adPlacement = await createAdPlacement(video, await createAdvertisement(admin), {
        deletedAt: new Date(),
      });

      const response = await postEvent(
        adEvent(video.id, adPlacement.id, PlaybackEventType.AD_SHOWN),
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ErrorMessages.INVALID_AD_REFERENCE);
    });

    it('rejects a skip of an ad that has no skip point', async () => {
      const admin = await createAdmin();
      const video = await createVideo(admin);
      const adPlacement = await createAdPlacement(video, await createAdvertisement(admin), {
        adType: AdType.MID_ROLL,
        startOffsetSeconds: 30,
        skipAfterSeconds: null,
      });

      const response = await postEvent(
        adEvent(video.id, adPlacement.id, PlaybackEventType.AD_SKIPPED),
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ErrorMessages.AD_NOT_SKIPPABLE);
      expect(await prisma.playbackEvent.count()).toBe(0);
    });
  });
});
