import request from 'supertest';
import { setTimeout as sleep } from 'node:timers/promises';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { fakeVideoHosting } from '../../src/lib/fakeVideoHosting';
import { VideoStatus } from '../../src/generated/prisma/enums';
import { ErrorMessages } from '../../src/constants/errorMessages.constants';
import { FakeHostingOutcome } from '../../src/constants/videoHosting.constants';
import type { Admin } from '../../src/generated/prisma/client.js';
import { resetDatabaseBeforeEachTest } from '../setup/resetDatabaseBeforeEachTest';
import { authHeaderFor, createAdmin } from '../helpers/factories';
import {
  TestApiPaths,
  TEST_SLOW_HOST_LATENCY_MS,
  TEST_VIDEO_FILE,
} from '../helpers/test.constants';

/**
 * @description Posts a video upload the way the admin UI does - multipart, with a title.
 */
const uploadVideo = (admin: Admin) =>
  request(app)
    .post(TestApiPaths.videos())
    .set('Authorization', authHeaderFor(admin))
    .field('title', 'Launch trailer')
    .attach('video', TEST_VIDEO_FILE.buffer, {
      filename: TEST_VIDEO_FILE.filename,
      contentType: TEST_VIDEO_FILE.contentType,
    });

describe('POST /videos - when the video host misbehaves', () => {
  resetDatabaseBeforeEachTest();

  it('stores a PROCESSING video with the host id when the upload succeeds', async () => {
    const admin = await createAdmin();

    const response = await uploadVideo(admin).expect(201);

    expect(response.body.data.video.status).toBe(VideoStatus.PROCESSING);
    const video = await prisma.video.findUniqueOrThrow({
      where: { id: response.body.data.video.id },
    });
    expect(video.externalId).toBeTruthy();
    expect(fakeVideoHosting.calls.uploads).toBe(1);
  });

  it.each([
    ['rejects the upload', FakeHostingOutcome.ERROR],
    ['is unavailable', FakeHostingOutcome.UNAVAILABLE],
  ])('answers 502 and keeps a FAILED record when the host %s', async (_label, outcome) => {
    fakeVideoHosting.configure({ uploadOutcome: outcome });
    const admin = await createAdmin();

    const response = await uploadVideo(admin);

    expect(response.status).toBe(502);
    expect(response.body.message).toBe(ErrorMessages.VIDEO_UPLOAD_FAILED);
    // The admin's library shows the attempt as failed rather than losing it.
    const videos = await prisma.video.findMany();
    expect(videos).toHaveLength(1);
    expect(videos[0]).toMatchObject({ status: VideoStatus.FAILED, externalId: null });
  });

  it('shows the failed upload in the admin list and as failed to viewers', async () => {
    fakeVideoHosting.configure({ uploadOutcome: FakeHostingOutcome.UNAVAILABLE });
    const admin = await createAdmin();
    await uploadVideo(admin).expect(502);
    const video = await prisma.video.findFirstOrThrow();

    const list = await request(app)
      .get(TestApiPaths.videos())
      .set('Authorization', authHeaderFor(admin))
      .expect(200);
    const playback = await request(app).get(TestApiPaths.playback(video.id)).expect(200);

    expect(list.body.data.videos[0].status).toBe(VideoStatus.FAILED);
    expect(playback.body.data).toMatchObject({
      status: VideoStatus.FAILED,
      playbackUrl: null,
      ads: [],
    });
  });

  it('waits for a slow host and only creates the row once it answers', async () => {
    fakeVideoHosting.configure({ latencyMs: TEST_SLOW_HOST_LATENCY_MS });
    const admin = await createAdmin();
    const startedAt = Date.now();

    const pending = uploadVideo(admin).then((response) => response);
    await sleep(TEST_SLOW_HOST_LATENCY_MS / 2);
    const rowsWhileWaiting = await prisma.video.count();
    const response = await pending;

    expect(rowsWhileWaiting).toBe(0);
    expect(response.status).toBe(201);
    expect(response.body.data.video.status).toBe(VideoStatus.PROCESSING);
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(TEST_SLOW_HOST_LATENCY_MS);
  });

  it('rejects an upload with no file before calling the host', async () => {
    const admin = await createAdmin();

    const response = await request(app)
      .post(TestApiPaths.videos())
      .set('Authorization', authHeaderFor(admin))
      .field('title', 'No file attached');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(ErrorMessages.MISSING_VIDEO_FILE);
    expect(fakeVideoHosting.calls.uploads).toBe(0);
    expect(await prisma.video.count()).toBe(0);
  });
});
