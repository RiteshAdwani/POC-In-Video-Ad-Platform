import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import type { Admin, Advertisement } from '../../src/generated/prisma/client.js';
import { resetDatabaseBeforeEachTest } from '../setup/resetDatabaseBeforeEachTest';
import { authHeaderFor, createAdmin, createAdvertisement } from '../helpers/factories';
import {
  TestApiPaths,
  TEST_CLICK_THROUGH_URL,
  TEST_DISALLOWED_CLICK_THROUGH_URLS,
  TEST_HTTP_CLICK_THROUGH_URL,
  TEST_IMAGE_FILE,
  TEST_NEW_AD_TITLE,
} from '../helpers/test.constants';

let admin: Admin;
let ad: Advertisement;

/**
 * @description Updates the test ad's click-through link as its owner.
 */
const patchClickThroughUrl = (clickThroughUrl: string | null) =>
  request(app)
    .patch(`${TestApiPaths.advertisements()}/${ad.id}`)
    .set('Authorization', authHeaderFor(admin))
    .send({ clickThroughUrl });

/**
 * @description The test ad's click-through link as currently stored.
 */
const storedClickThroughUrl = async () =>
  (await prisma.advertisement.findUniqueOrThrow({ where: { id: ad.id } })).clickThroughUrl;

describe('ad click-through links', () => {
  resetDatabaseBeforeEachTest();

  beforeEach(async () => {
    admin = await createAdmin();
    ad = await createAdvertisement(admin);
  });

  describe('updating an ad', () => {
    it.each(TEST_DISALLOWED_CLICK_THROUGH_URLS)(
      'rejects %s with 400 and keeps the stored link',
      async (url) => {
        const response = await patchClickThroughUrl(url);

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual([
          expect.objectContaining({ field: 'clickThroughUrl' }),
        ]);
        expect(await storedClickThroughUrl()).toBe(TEST_CLICK_THROUGH_URL);
      },
    );

    it.each([TEST_CLICK_THROUGH_URL, TEST_HTTP_CLICK_THROUGH_URL])('accepts %s', async (url) => {
      const response = await patchClickThroughUrl(url);

      expect(response.status).toBe(200);
      expect(await storedClickThroughUrl()).toBe(url);
    });

    it('still lets the link be cleared', async () => {
      const response = await patchClickThroughUrl(null);

      expect(response.status).toBe(200);
      expect(await storedClickThroughUrl()).toBeNull();
    });
  });

  describe('creating an ad', () => {
    it.each(TEST_DISALLOWED_CLICK_THROUGH_URLS)(
      'rejects %s with 400 and stores nothing',
      async (url) => {
        const response = await request(app)
          .post(TestApiPaths.advertisements())
          .set('Authorization', authHeaderFor(admin))
          .field('title', TEST_NEW_AD_TITLE)
          .field('clickThroughUrl', url)
          .attach('assetFile', TEST_IMAGE_FILE.buffer, {
            filename: TEST_IMAGE_FILE.filename,
            contentType: TEST_IMAGE_FILE.contentType,
          });

        expect(response.status).toBe(400);
        expect(await prisma.advertisement.count({ where: { title: TEST_NEW_AD_TITLE } })).toBe(0);
      },
    );
  });
});
