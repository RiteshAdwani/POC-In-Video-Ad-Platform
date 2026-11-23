import { randomUUID } from 'node:crypto';
import { prisma } from '../../src/lib/prisma';
import { signAccessToken } from '../../src/lib/jwt';
import { BEARER_PREFIX } from '../../src/constants/auth.constants';
import {
  AdType,
  AssetType,
  PlaybackEventType,
  VideoStatus,
  type User,
  type AdPlacement,
  type Advertisement,
  type Prisma,
  type Video,
} from '../../src/generated/prisma/client.js';
import {
  TEST_CLICK_THROUGH_URL,
  TEST_IMAGE_ASSET_URL,
  TEST_PLAYBACK_URL,
  TEST_VIDEO_ASSET_URL,
  TEST_VIDEO_DURATION_SECONDS,
} from './test.constants';

/**
 * @description A user with a unique email - rows go straight into the DB, skipping login.
 */
export const createUser = (): Promise<User> =>
  prisma.user.create({
    data: {
      email: `user-${randomUUID()}@example.test`,
      // Never a valid bcrypt hash, so no password can log in - tests sign tokens instead.
      passwordHash: randomUUID(),
      firstName: 'Test',
      lastName: 'User',
    },
  });

/**
 * @description The Authorization header value a logged-in user's requests carry.
 */
export const authHeaderFor = (user: User): string =>
  `${BEARER_PREFIX}${signAccessToken({ userId: user.id })}`;

/**
 * @description A READY, playable video by default - override status (and friends) for others.
 */
export const createVideo = (
  user: User,
  overrides: Partial<Prisma.VideoUncheckedCreateInput> = {},
): Promise<Video> =>
  prisma.video.create({
    data: {
      title: 'Test video',
      userId: user.id,
      status: VideoStatus.READY,
      externalId: `hosted-${randomUUID()}`,
      playbackUrl: TEST_PLAYBACK_URL,
      durationSeconds: TEST_VIDEO_DURATION_SECONDS,
      ...overrides,
    },
  });

/**
 * @description A video ad (for pre/mid-roll) by default; pass AssetType.IMAGE for a banner.
 */
export const createAdvertisement = (
  user: User,
  assetType: AssetType = AssetType.VIDEO,
): Promise<Advertisement> =>
  prisma.advertisement.create({
    data: {
      title: 'Test ad',
      userId: user.id,
      assetType,
      assetUrl: assetType === AssetType.IMAGE ? TEST_IMAGE_ASSET_URL : TEST_VIDEO_ASSET_URL,
      clickThroughUrl: TEST_CLICK_THROUGH_URL,
    },
  });

/**
 * @description A skippable pre-roll by default - override adType/offsets for other placements.
 */
export const createAdPlacement = (
  video: Video,
  advertisement: Advertisement,
  overrides: Partial<Prisma.AdPlacementUncheckedCreateInput> = {},
): Promise<AdPlacement> =>
  prisma.adPlacement.create({
    data: {
      videoId: video.id,
      advertisementId: advertisement.id,
      adType: AdType.PRE_ROLL,
      startOffsetSeconds: 0,
      skipAfterSeconds: 5,
      ...overrides,
    },
  });

/**
 * @description A raw event written straight to the log, skipping the ingestion endpoint - for
 * aggregation tests that need events on a fixed past day.
 */
export const createPlaybackEvent = (
  video: Video,
  eventType: PlaybackEventType,
  overrides: Partial<Prisma.PlaybackEventUncheckedCreateInput> = {},
) =>
  prisma.playbackEvent.create({
    data: {
      videoId: video.id,
      eventType,
      sessionId: `session-${randomUUID()}`,
      occurredAt: new Date(),
      ...overrides,
    },
  });

/**
 * @description A user's READY video with one ad placement - everything an event or count needs.
 */
export const createVideoWithAdPlacement = async () => {
  const user = await createUser();
  const video = await createVideo(user);
  const adPlacement = await createAdPlacement(video, await createAdvertisement(user));
  return { user, video, adPlacement };
};
