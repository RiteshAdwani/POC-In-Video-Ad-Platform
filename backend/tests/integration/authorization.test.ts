import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { AdType, PlaybackEventType } from '../../src/generated/prisma/enums';
import type {
  Admin,
  AdPlacement,
  Advertisement,
  Video,
} from '../../src/generated/prisma/client.js';
import { ErrorMessages } from '../../src/constants/errorMessages.constants';
import { resetDatabaseBeforeEachTest } from '../setup/resetDatabaseBeforeEachTest';
import {
  authHeaderFor,
  createAdmin,
  createAdPlacement,
  createAdvertisement,
  createVideo,
} from '../helpers/factories';
import { TestApiPaths, TEST_UNKNOWN_ID } from '../helpers/test.constants';

type HttpMethod = 'get' | 'post' | 'patch' | 'delete';

// Alice owns everything below; Bob is a second, fully authenticated admin.
let alice: Admin;
let bob: Admin;
let aliceVideo: Video;
let aliceAd: Advertisement;
let alicePlacement: AdPlacement;
let bobAd: Advertisement;

/**
 * @description Sends a request as the given admin, with a JSON body when there is one.
 */
const sendAs = (admin: Admin, method: HttpMethod, path: string, body?: object) => {
  const pending = request(app)[method](path).set('Authorization', authHeaderFor(admin));
  return body ? pending.send(body) : pending;
};

describe('admin authorization', () => {
  resetDatabaseBeforeEachTest();

  beforeEach(async () => {
    alice = await createAdmin();
    bob = await createAdmin();
    aliceVideo = await createVideo(alice);
    aliceAd = await createAdvertisement(alice);
    alicePlacement = await createAdPlacement(aliceVideo, aliceAd);
    bobAd = await createAdvertisement(bob);
  });

  describe('every admin route needs a valid token', () => {
    it.each([
      ['get', TestApiPaths.videos()],
      ['post', TestApiPaths.videos()],
      ['get', TestApiPaths.advertisements()],
      ['post', TestApiPaths.advertisements()],
      ['get', TestApiPaths.dashboard()],
      ['post', `${TestApiPaths.aggregation()}/runs`],
    ] as const)('%s %s answers 401 without a token', async (method, path) => {
      const response = await request(app)[method](path);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(ErrorMessages.MISSING_AUTH_HEADER);
    });

    it('answers 401 for a forged token', async () => {
      const response = await request(app)
        .get(TestApiPaths.videos())
        .set('Authorization', 'Bearer not.a.real-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(ErrorMessages.INVALID_ACCESS_TOKEN);
    });
  });

  describe("another admin's resources answer 404", () => {
    it.each<[string, HttpMethod, () => string, () => object | undefined]>([
      ['read a video', 'get', () => `${TestApiPaths.videos()}/${aliceVideo.id}`, () => undefined],
      [
        'check a video status',
        'get',
        () => `${TestApiPaths.videos()}/${aliceVideo.id}/status`,
        () => undefined,
      ],
      [
        'edit a video',
        'patch',
        () => `${TestApiPaths.videos()}/${aliceVideo.id}`,
        () => ({ title: 'Mine now' }),
      ],
      [
        'delete a video',
        'delete',
        () => `${TestApiPaths.videos()}/${aliceVideo.id}`,
        () => undefined,
      ],
      [
        'list the placements on a video',
        'get',
        () => `${TestApiPaths.videos()}/${aliceVideo.id}/placements`,
        () => undefined,
      ],
      [
        'place an ad on a video',
        'post',
        () => `${TestApiPaths.videos()}/${aliceVideo.id}/placements`,
        () => ({ advertisementId: bobAd.id, adType: AdType.PRE_ROLL, startOffsetSeconds: 0 }),
      ],
      [
        'edit a placement',
        'patch',
        () => `${TestApiPaths.videos()}/${aliceVideo.id}/placements/${alicePlacement.id}`,
        () => ({ skipAfterSeconds: 1 }),
      ],
      [
        'remove a placement',
        'delete',
        () => `${TestApiPaths.videos()}/${aliceVideo.id}/placements/${alicePlacement.id}`,
        () => undefined,
      ],
      [
        'read an ad',
        'get',
        () => `${TestApiPaths.advertisements()}/${aliceAd.id}`,
        () => undefined,
      ],
      [
        'list where an ad is placed',
        'get',
        () => `${TestApiPaths.advertisements()}/${aliceAd.id}/placements`,
        () => undefined,
      ],
      [
        'edit an ad',
        'patch',
        () => `${TestApiPaths.advertisements()}/${aliceAd.id}`,
        () => ({ title: 'Mine now' }),
      ],
      [
        'delete an ad',
        'delete',
        () => `${TestApiPaths.advertisements()}/${aliceAd.id}`,
        () => undefined,
      ],
    ])('cannot %s', async (_action, method, path, body) => {
      const response = await sendAs(bob, method, path(), body());

      expect(response.status).toBe(404);
    });

    it('leaves the resources untouched after the rejected writes', async () => {
      await sendAs(bob, 'patch', `${TestApiPaths.videos()}/${aliceVideo.id}`, {
        title: 'Mine now',
      });
      await sendAs(bob, 'delete', `${TestApiPaths.videos()}/${aliceVideo.id}`);
      await sendAs(bob, 'delete', `${TestApiPaths.advertisements()}/${aliceAd.id}`);

      const video = await prisma.video.findUniqueOrThrow({ where: { id: aliceVideo.id } });
      const advertisement = await prisma.advertisement.findUniqueOrThrow({
        where: { id: aliceAd.id },
      });
      expect(video).toMatchObject({ title: aliceVideo.title, deletedAt: null });
      expect(advertisement.deletedAt).toBeNull();
      expect(await prisma.adPlacement.count()).toBe(1);
    });

    it("cannot place another admin's ad on their own video", async () => {
      const bobVideo = await createVideo(bob);

      const response = await sendAs(
        bob,
        'post',
        `${TestApiPaths.videos()}/${bobVideo.id}/placements`,
        {
          advertisementId: aliceAd.id,
          adType: AdType.PRE_ROLL,
          startOffsetSeconds: 0,
        },
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(ErrorMessages.ADVERTISEMENT_NOT_FOUND);
    });

    it('gives the same answer for a resource that does not exist at all', async () => {
      const notOwned = await sendAs(bob, 'get', `${TestApiPaths.videos()}/${aliceVideo.id}`);
      const missing = await sendAs(bob, 'get', `${TestApiPaths.videos()}/${TEST_UNKNOWN_ID}`);

      expect(notOwned.status).toBe(missing.status);
      expect(notOwned.body).toEqual(missing.body);
    });
  });

  describe('lists and stats only ever include your own data', () => {
    it("leaves another admin's videos and ads out of your lists", async () => {
      const bobVideo = await createVideo(bob);

      const videos = await sendAs(bob, 'get', TestApiPaths.videos()).expect(200);
      const ads = await sendAs(bob, 'get', TestApiPaths.advertisements()).expect(200);

      expect(videos.body.data.videos.map((video: Video) => video.id)).toEqual([bobVideo.id]);
      expect(ads.body.data.advertisements.map((ad: Advertisement) => ad.id)).toEqual([bobAd.id]);
    });

    it("answers 404 when scoping the dashboard to another admin's video or ad", async () => {
      const range = { startDate: '2026-01-01', endDate: '2026-12-31' };

      const byVideo = await sendAs(bob, 'get', TestApiPaths.dashboard()).query({
        ...range,
        videoId: aliceVideo.id,
      });
      const byAd = await sendAs(bob, 'get', TestApiPaths.dashboard()).query({
        ...range,
        advertisementId: aliceAd.id,
      });

      expect(byVideo.status).toBe(404);
      expect(byAd.status).toBe(404);
    });

    it("never counts another admin's events in your dashboard totals", async () => {
      const today = new Date().toISOString().slice(0, 10);
      await prisma.dailyCount.create({
        data: {
          videoId: aliceVideo.id,
          adPlacementId: alicePlacement.id,
          eventType: PlaybackEventType.AD_SHOWN,
          eventDate: new Date(today),
          eventCount: 50,
        },
      });

      const aliceStats = await sendAs(alice, 'get', TestApiPaths.dashboard())
        .query({ startDate: today, endDate: today })
        .expect(200);
      const bobStats = await sendAs(bob, 'get', TestApiPaths.dashboard())
        .query({ startDate: today, endDate: today })
        .expect(200);

      expect(aliceStats.body.data.impressions).toBe(50);
      expect(bobStats.body.data.impressions).toBe(0);
    });
  });
});
