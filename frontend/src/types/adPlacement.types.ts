import type { AdType } from '../constants/ad.constants';

export type AdPlacement = {
  id: string;
  videoId: string;
  startOffsetSeconds: number;
  durationSeconds: number | null;
  skipAfterSeconds: number | null;
  advertisement: {
    id: string;
    title: string;
    adType: AdType;
  };
};
