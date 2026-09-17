import { z } from 'zod';
import { PlaybackEventType } from '../../generated/prisma/enums';

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
    sessionId: z.string().min(1),
    eventType: z.enum(PlaybackEventType),
    occurredAt: z.coerce.date(),
    adId: z.uuid().optional(),
  })
  .superRefine(({ eventType, adId }, ctx) => {
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
  });
