import { prisma } from './prisma';
import { logger } from './logger';
import { checkAndUpdateVideoStatus } from '../modules/videos/videos.service';
import { VideoStatus } from '../generated/prisma/client.js';
import {
  POLLER_INTERVAL_MS,
  INITIAL_BACKOFF_MS,
  BACKOFF_MULTIPLIER,
  MAX_BACKOFF_MS,
} from '../constants/poller.constants';

interface PollSchedule {
  // Timestamp (ms since epoch) - this video isn't checked again until Date.now() reaches this.
  nextCheckAt: number;
  // How long to wait before the check that's about to run, given the schedule was due. After
  // that check happens, this same field is overwritten with the doubled value for the round
  // after - it does not describe how long we just waited.
  waitBeforeNextCheckMs: number;
}

/**
 * @description Periodically re-checks PROCESSING videos against Cloudinary and flips their
 * status once ready/failed - so a video's status becomes correct on its own, without depending
 * on an admin happening to call GET /:id/status for it.
 *
 * Each video is checked with exponential backoff, tracked in this in-memory map keyed by video
 * id: a freshly-seen video is checked almost immediately, and every check that comes back still
 * PROCESSING doubles the wait before the next one (capped). This is deliberately in-memory, not
 * persisted - it's the poller's own scheduling state, not a fact about the video, and it resets
 * harmlessly to the fast initial interval on a server restart. It also means the manual
 * GET /:id/status endpoint (which doesn't touch this map) is never throttled by it.
 */
export const startVideoPoller = (): NodeJS.Timeout => {
  const videoPollSchedules = new Map<string, PollSchedule>();
  let isTickInProgress = false;

  return setInterval(() => {
    if (isTickInProgress) return;
    isTickInProgress = true;

    void (async () => {
      try {
        const processingVideos = await prisma.video.findMany({
          where: { status: VideoStatus.PROCESSING },
        });
        const stillProcessingIds = new Set(processingVideos.map((v) => v.id));

        // Drop schedules for videos that resolved (or vanished) since the last tick - otherwise
        // this map only ever grows for the life of the process.
        for (const videoId of videoPollSchedules.keys()) {
          if (!stillProcessingIds.has(videoId)) {
            videoPollSchedules.delete(videoId);
          }
        }

        const now = Date.now();

        for (const video of processingVideos) {
          // First time seeing this video - default to "check it right away".
          const schedule = videoPollSchedules.get(video.id) ?? {
            nextCheckAt: now,
            waitBeforeNextCheckMs: INITIAL_BACKOFF_MS,
          };

          // Not due yet - keep its schedule as-is and skip straight to the next video.
          const isDue = now >= schedule.nextCheckAt;
          if (!isDue) {
            videoPollSchedules.set(video.id, schedule);
            continue;
          }

          try {
            // Due - actually hit Cloudinary and update the DB row if its status changed.
            const updatedVideo = await checkAndUpdateVideoStatus(video);
            // Resolved (READY/FAILED) - done, no more scheduling needed for this video.
            if (updatedVideo.status !== VideoStatus.PROCESSING) {
              videoPollSchedules.delete(video.id);
              continue;
            }
          } catch (error) {
            // Falls through to the reschedule below rather than `continue`-ing past it - an
            // errored check still counts as "still processing, try again later with backoff",
            // the same as one that succeeded but reported no result yet.
            logger.error(error, `Video poller failed for video ${video.id}`);
          }

          // Still PROCESSING (or the check errored) - push the next check out further, doubling
          // the wait each time up to the cap, so a slow/stuck video gets checked less and less.
          videoPollSchedules.set(video.id, {
            nextCheckAt: now + schedule.waitBeforeNextCheckMs,
            waitBeforeNextCheckMs: Math.min(
              schedule.waitBeforeNextCheckMs * BACKOFF_MULTIPLIER,
              MAX_BACKOFF_MS,
            ),
          });
        }
      } finally {
        isTickInProgress = false;
      }
    })();
  }, POLLER_INTERVAL_MS);
};
