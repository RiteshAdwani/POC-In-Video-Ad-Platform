import { prisma } from '../../lib/prisma';
import { videoHosting } from '../../lib/videoHosting';
import { logger } from '../../lib/logger';
import type { Video } from '../../generated/prisma/client.js';
import { VideoStatus } from '../../generated/prisma/client.js';
import { MAX_PROCESSING_AGE_MS } from '../../constants/poller.constants';

type VideoWithAdPlacementCount = Video & { _count: { adPlacements: number } };

/**
 * @description Flattens Prisma's `_count.adPlacements` aggregate into the flat `adPlacementCount`
 * field the frontend actually consumes.
 */
export const toVideoDto = ({ _count, ...video }: VideoWithAdPlacementCount) => ({
  ...video,
  adPlacementCount: _count.adPlacements,
});

/**
 * @description Checks a video's live status with the host and updates the DB row if it changed.
 * Shared by the on-demand status endpoint and the background poller, so both stay in sync.
 *
 * A transient failure calling the host (network blip, rate limit, or our own timeout) doesn't
 * flip the video to FAILED on its own - it's treated the same as "still processing" so the next
 * check tries again. It only becomes FAILED once the host itself reports the transcode failed,
 * or the video has been PROCESSING past MAX_PROCESSING_AGE_MS regardless of why (stuck at the
 * host, or repeatedly failing/timing out our own checks) - so a video can't sit unresolved
 * forever either way.
 */
export const checkAndUpdateVideoStatus = async (video: Video): Promise<Video> => {
  const isPastMaxAge = Date.now() - video.createdAt.getTime() > MAX_PROCESSING_AGE_MS;

  let newStatus: VideoStatus = VideoStatus.PROCESSING;
  let playbackUrl: string | undefined;
  let durationSeconds: number | undefined;

  try {
    const hosted = await videoHosting.getStatus(video.externalId!);

    if (hosted.status === VideoStatus.READY) {
      newStatus = VideoStatus.READY;
      ({ playbackUrl, durationSeconds } = hosted);
    } else if (hosted.status === VideoStatus.FAILED || isPastMaxAge) {
      newStatus = VideoStatus.FAILED;
    }
  } catch (error) {
    logger.error(error, `Video hosting status check failed for video ${video.id}`);
    if (!isPastMaxAge) {
      return video;
    }
    newStatus = VideoStatus.FAILED;
  }

  // A status that didn't change is normally a no-op - except a READY video that's still missing
  // durationSeconds (the host hadn't reported it back on the check that first flipped the
  // status to READY) gets one more chance to pick it up, rather than staying null forever.
  const recoveredMissingDuration = video.durationSeconds == null && durationSeconds != null;
  if (newStatus === video.status && !recoveredMissingDuration) {
    return video;
  }

  const updated = await prisma.video.update({
    where: { id: video.id },
    data: {
      status: newStatus,
      ...(playbackUrl ? { playbackUrl } : {}),
      ...(durationSeconds != null ? { durationSeconds } : {}),
    },
  });

  if (newStatus === VideoStatus.FAILED) {
    // Best-effort: the DB row is the source of truth and is already updated regardless of
    // whether this succeeds - a dangling hosted file is a storage cost, not a correctness
    // bug, so a failed delete here is logged and left for manual cleanup rather than retried.
    try {
      await videoHosting.deleteVideo(video.externalId!);
    } catch (error) {
      logger.error(error, `Failed to delete hosted video for video ${video.id}`);
    }
  }

  return updated;
};
