import { describe, expect, it } from 'vitest';
import { recordPlaybackEventSchema } from '../../src/modules/public/events.schema';
import { PlaybackEventType } from '../../src/generated/prisma/enums';
import {
  MAX_OCCURRED_AT_FUTURE_MS,
  MAX_OCCURRED_AT_PAST_MS,
  MAX_SESSION_ID_LENGTH,
} from '../../src/constants/events.constants';

const VIDEO_ID = '11111111-1111-4111-8111-111111111111';
const AD_ID = '22222222-2222-4222-8222-222222222222';

const baseEvent = {
  videoId: VIDEO_ID,
  sessionId: 'a-session-id',
  occurredAt: new Date().toISOString(),
};

describe('recordPlaybackEventSchema', () => {
  it('accepts a non-ad-scoped event with no adId', () => {
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      eventType: PlaybackEventType.VIDEO_STARTED,
    });
    expect(result.success).toBe(true);
  });

  it('accepts an ad-scoped event that includes adId', () => {
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      eventType: PlaybackEventType.AD_SHOWN,
      adId: AD_ID,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an ad-scoped event missing adId', () => {
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      eventType: PlaybackEventType.AD_CLICKED,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('adId'))).toBe(true);
    }
  });

  it('rejects a non-ad-scoped event that includes adId', () => {
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      eventType: PlaybackEventType.VIDEO_FINISHED,
      adId: AD_ID,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('adId'))).toBe(true);
    }
  });

  it('rejects a sessionId longer than MAX_SESSION_ID_LENGTH', () => {
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      eventType: PlaybackEventType.VIDEO_STARTED,
      sessionId: 'x'.repeat(MAX_SESSION_ID_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty sessionId', () => {
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      eventType: PlaybackEventType.VIDEO_STARTED,
      sessionId: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts an occurredAt just inside the future bound', () => {
    const occurredAt = new Date(Date.now() + MAX_OCCURRED_AT_FUTURE_MS - 1000).toISOString();
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      occurredAt,
      eventType: PlaybackEventType.VIDEO_STARTED,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an occurredAt beyond the future bound', () => {
    const occurredAt = new Date(Date.now() + MAX_OCCURRED_AT_FUTURE_MS + 60_000).toISOString();
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      occurredAt,
      eventType: PlaybackEventType.VIDEO_STARTED,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('occurredAt'))).toBe(true);
    }
  });

  it('accepts an occurredAt just inside the past bound', () => {
    const occurredAt = new Date(Date.now() - MAX_OCCURRED_AT_PAST_MS + 60_000).toISOString();
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      occurredAt,
      eventType: PlaybackEventType.VIDEO_STARTED,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an occurredAt beyond the past bound', () => {
    const occurredAt = new Date(Date.now() - MAX_OCCURRED_AT_PAST_MS - 60_000).toISOString();
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      occurredAt,
      eventType: PlaybackEventType.VIDEO_STARTED,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('occurredAt'))).toBe(true);
    }
  });

  it('rejects an invalid videoId that is not a UUID', () => {
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      videoId: 'not-a-uuid',
      eventType: PlaybackEventType.VIDEO_STARTED,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown eventType', () => {
    const result = recordPlaybackEventSchema.safeParse({
      ...baseEvent,
      eventType: 'NOT_A_REAL_EVENT_TYPE',
    });
    expect(result.success).toBe(false);
  });
});
