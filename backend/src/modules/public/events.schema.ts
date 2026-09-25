import { z } from 'zod';
import { PlaybackEventType } from '../../generated/prisma/enums';
import {
  MAX_OCCURRED_AT_FUTURE_MS,
  MAX_OCCURRED_AT_PAST_MS,
  MAX_SESSION_ID_LENGTH,
} from '../../constants/events.constants';

// video_started/video_finished describe the video itself; the other four describe one specific
// ad impression and can't exist without knowing which ad they're about.
const AD_SCOPED_EVENT_TYPES = new Set<PlaybackEventType>([
  PlaybackEventType.AD_SHOWN,
  PlaybackEventType.AD_SKIPPED,
  PlaybackEventType.AD_COMPLETED,
  PlaybackEventType.AD_CLICKED,
]);

export const recordPlaybackEventSchema = z
  .object({
    videoId: z.uuid(),
    sessionId: z.string().min(1).max(MAX_SESSION_ID_LENGTH),
    eventType: z.enum(PlaybackEventType),
    occurredAt: z.coerce.date(),
    adId: z.uuid().optional(),
  })
  .superRefine(({ eventType, adId, occurredAt }, ctx) => {
    const isAdScoped = AD_SCOPED_EVENT_TYPES.has(eventType);

    if (isAdScoped && !adId) {
      ctx.addIssue({ code: 'custom', path: ['adId'], message: `${eventType} requires adId` });
    }
    if (!isAdScoped && adId) {
      ctx.addIssue({
        code: 'custom',
        path: ['adId'],
        message: `${eventType} must not include adId`,
      });
    }

    // A real client reports this right as it happens - reject anything that couldn't be a live
    // playback timestamp, so one request can't plant a fact into an arbitrary calendar day.
    const deltaMs = occurredAt.getTime() - Date.now();
    if (deltaMs > MAX_OCCURRED_AT_FUTURE_MS) {
      ctx.addIssue({
        code: 'custom',
        path: ['occurredAt'],
        message: 'occurredAt is too far in the future',
      });
    }
    if (deltaMs < -MAX_OCCURRED_AT_PAST_MS) {
      ctx.addIssue({
        code: 'custom',
        path: ['occurredAt'],
        message: 'occurredAt is too far in the past',
      });
    }
  });
