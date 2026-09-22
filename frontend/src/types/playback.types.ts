import type { AdType } from '../constants/ad.constants';
import type { VideoStatus } from '../constants/video.constants';

export type PlaybackAd = {
  id: string;
  type: AdType;
  title: string;
  assetUrl: string;
  clickThroughUrl: string | null;
  startOffsetSeconds: number;
  durationSeconds: number | null;
  skipAfterSeconds: number | null;
};

export type PlaybackConfig = {
  title: string;
  description: string | null;
  status: VideoStatus;
  playbackUrl: string | null;
  ads: PlaybackAd[];
};

export type PublicVideoSummary = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
};
