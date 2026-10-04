import type { PlaybackEventType } from '../constants/playback.constants';
import type { PublicVideoSummary } from '../types/playback.types';
import type { PaginationMeta } from '../types/pagination.types';

export type RecordPlaybackEventRequestDto = {
  videoId: string;
  sessionId: string;
  eventType: PlaybackEventType;
  occurredAt: string;
  adId?: string;
};

export type PublicVideosResponseDto = {
  videos: PublicVideoSummary[];
  pagination: PaginationMeta;
};
