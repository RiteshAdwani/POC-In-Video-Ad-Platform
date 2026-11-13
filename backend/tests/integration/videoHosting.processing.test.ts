import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { fakeVideoHosting } from '../../src/lib/fakeVideoHosting';
import { checkAndUpdateVideoStatus } from '../../src/modules/videos/videos.service';
import { VideoStatus } from '../../src/generated/prisma/enums';
import type { Admin } from '../../src/generated/prisma/client.js';
import { MAX_PROCESSING_AGE_MS } from '../../src/constants/poller.constants';
import {
  FAKE_DURATION_SECONDS,
  FAKE_PLAYBACK_URL,
  FakeHostingOutcome,
} from '../../src/constants/videoHosting.constants';
import { resetDatabaseBeforeEachTest } from '../setup/resetDatabaseBeforeEachTest';
import {
  authHeaderFor,
  createAdmin,
  createAdPlacement,
  createAdvertisement,
  createVideo,
} from '../helpers/factories';
import { TestApiPaths, TEST_SLOW_HOST_LATENCY_MS } from '../helpers/test.constants';

/**
 * @description A video the host is still transcoding, with a pre-roll already placed on it.
 */
const createProcessingVideo = async (admin: Admin, createdAt = new Date()) => {
  const video = await createVideo(admin, {
    status: VideoStatus.PROCESSING,
    playbackUrl: null,
    durationSeconds: null,
    createdAt,
  });
  await createAdPlacement(video, await createAdvertisement(admin));
  return video;
};

const getPlayback = (videoId: string) =>
  request(app).get(TestApiPaths.playback(videoId)).expect(200);

describe('video processing - when status checks against the host misbehave', () => {
  resetDatabaseBeforeEachTest();

  it('flips to READY with the playback URL and duration once the host is done', async () => {
    const video = await createProcessingVideo(await createAdmin());

    const updated = await checkAndUpdateVideoStatus(video);
    const playback = await getPlayback(video.id);

    expect(updated).toMatchObject({
      status: VideoStatus.READY,
      playbackUrl: FAKE_PLAYBACK_URL,
      durationSeconds: FAKE_DURATION_SECONDS,
    });
    expect(playback.body.data.status).toBe(VideoStatus.READY);
    expect(playback.body.data.playbackUrl).toBe(FAKE_PLAYBACK_URL);
    expect(playback.body.data.ads).toHaveLength(1);
  });

  it('stays PROCESSING, with no URL or ads for the player, while the host is still working', async () => {
    fakeVideoHosting.configure({ reportedStatus: VideoStatus.PROCESSING });
    const video = await createProcessingVideo(await createAdmin());

    const updated = await checkAndUpdateVideoStatus(video);
    const playback = await getPlayback(video.id);

    expect(updated.status).toBe(VideoStatus.PROCESSING);
    expect(playback.body.data).toMatchObject({
      status: VideoStatus.PROCESSING,
      playbackUrl: null,
      ads: [],
    });
  });

  it.each([
    ['errors', FakeHostingOutcome.ERROR],
    ['is unavailable', FakeHostingOutcome.UNAVAILABLE],
  ])('keeps the video PROCESSING, not FAILED, when a status check %s', async (_label, outcome) => {
    fakeVideoHosting.configure({ statusOutcome: outcome });
    const admin = await createAdmin();
    const video = await createProcessingVideo(admin);

    const statusResponse = await request(app)
      .get(`${TestApiPaths.videos()}/${video.id}/status`)
      .set('Authorization', authHeaderFor(admin));
    const playback = await getPlayback(video.id);

    // The admin's status check succeeds and reports the last known state, not a 5xx.
    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.data.video.status).toBe(VideoStatus.PROCESSING);
    expect(playback.body.data).toMatchObject({ status: VideoStatus.PROCESSING, playbackUrl: null });
    expect(fakeVideoHosting.calls.deletes).toHaveLength(0);
  });

  it('recovers on the next check once a failing host comes back', async () => {
    fakeVideoHosting.configure({ statusOutcome: FakeHostingOutcome.UNAVAILABLE });
    const video = await createProcessingVideo(await createAdmin());
    const afterOutage = await checkAndUpdateVideoStatus(video);

    fakeVideoHosting.configure({ statusOutcome: FakeHostingOutcome.SUCCEED });
    const afterRecovery = await checkAndUpdateVideoStatus(afterOutage);

    expect(afterOutage.status).toBe(VideoStatus.PROCESSING);
    expect(afterRecovery.status).toBe(VideoStatus.READY);
  });

  it('still resolves a video when the host answers slowly', async () => {
    fakeVideoHosting.configure({ latencyMs: TEST_SLOW_HOST_LATENCY_MS });
    const video = await createProcessingVideo(await createAdmin());

    const updated = await checkAndUpdateVideoStatus(video);

    expect(updated.status).toBe(VideoStatus.READY);
  });

  it('gives up with FAILED once checks have kept failing past the max processing age', async () => {
    fakeVideoHosting.configure({ statusOutcome: FakeHostingOutcome.UNAVAILABLE });
    const longAgo = new Date(Date.now() - MAX_PROCESSING_AGE_MS - 60_000);
    const video = await createProcessingVideo(await createAdmin(), longAgo);

    const updated = await checkAndUpdateVideoStatus(video);
    const playback = await getPlayback(video.id);

    expect(updated.status).toBe(VideoStatus.FAILED);
    expect(playback.body.data).toMatchObject({
      status: VideoStatus.FAILED,
      playbackUrl: null,
      ads: [],
    });
    // The hosted file is cleaned up, since nothing will ever play it.
    expect(fakeVideoHosting.calls.deletes).toEqual([video.externalId]);
  });

  it('marks the video FAILED when the host reports the transcode failed', async () => {
    fakeVideoHosting.configure({ reportedStatus: VideoStatus.FAILED });
    const video = await createProcessingVideo(await createAdmin());

    const updated = await checkAndUpdateVideoStatus(video);

    expect(updated.status).toBe(VideoStatus.FAILED);
    expect(fakeVideoHosting.calls.deletes).toEqual([video.externalId]);
    expect((await prisma.video.findUniqueOrThrow({ where: { id: video.id } })).status).toBe(
      VideoStatus.FAILED,
    );
  });
});
