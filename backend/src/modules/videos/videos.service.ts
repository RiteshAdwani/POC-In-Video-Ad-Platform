import { prisma } from '../../lib/prisma';
import { getVideoResource, deleteVideoResource } from '../../lib/cloudinary';
import { logger } from '../../lib/logger';
import type { Video } from '../../generated/prisma/client.js';
import { VideoStatus } from '../../generated/prisma/client.js';
import { MAX_PROCESSING_AGE_MS } from '../../constants/poller.constants';

type VideoWithPlacementCount = Video & { _count: { adPlacements: number } };

/**
 * @description Flattens Prisma's `_count.adPlacements` aggregate into the flat `adPlacementCount`
 * field the frontend actually consumes.
 */
export const toVideoDto = ({ _count, ...video }: VideoWithPlacementCount) => ({
  ...video,
  adPlacementCount: _count.adPlacements,
});

/**
 * @description Checks a video's live Cloudinary status and updates the DB row if it changed.
 * Shared by the on-demand status endpoint and the background poller, so both stay in sync.
 *
 * A transient failure calling Cloudinary (network blip, rate limit, or our own timeout) doesn't
 * flip the video to FAILED on its own - it's treated the same as "still processing" so the next
 * check tries again. It only becomes FAILED once a Cloudinary-reported per-asset error shows up
 * on the `derived` transformation, or the video has been PROCESSING past MAX_PROCESSING_AGE_MS
 * regardless of why (stuck at Cloudinary, or repeatedly failing/timing out our own checks) - so a
 * video can't sit unresolved forever either way.
 */
export const checkAndUpdateVideoStatus = async (video: Video): Promise<Video> => {
  const isPastMaxAge = Date.now() - video.createdAt.getTime() > MAX_PROCESSING_AGE_MS;

  let newStatus: VideoStatus = VideoStatus.PROCESSING;
  let playbackUrl: string | undefined;

  try {
    const resource = await getVideoResource(video.externalId!);
    const derived = (resource.derived as Array<Record<string, unknown>> | undefined)?.[0];

    if (derived?.secure_url) {
      newStatus = VideoStatus.READY;
      playbackUrl = derived.secure_url as string;
    } else if (derived?.error || isPastMaxAge) {
      newStatus = VideoStatus.FAILED;
    }
  } catch (error) {
    logger.error(error, `Cloudinary status check failed for video ${video.id}`);
    if (!isPastMaxAge) {
      return video;
    }
    newStatus = VideoStatus.FAILED;
  }

  if (newStatus === video.status) {
    return video;
  }

  const updated = await prisma.video.update({
    where: { id: video.id },
    data: { status: newStatus, ...(playbackUrl ? { playbackUrl } : {}) },
  });

  if (newStatus === VideoStatus.FAILED) {
    // Best-effort: the DB row is the source of truth and is already updated regardless of
    // whether this succeeds - a dangling Cloudinary asset is a storage cost, not a correctness
    // bug, so a failed delete here is logged and left for manual cleanup rather than retried.
    try {
      await deleteVideoResource(video.externalId!);
    } catch (error) {
      logger.error(error, `Failed to delete Cloudinary asset for video ${video.id}`);
    }
  }

  return updated;
};
