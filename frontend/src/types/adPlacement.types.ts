import type { AdType, AssetType } from '../constants/ad.constants';

export type AdPlacement = {
  id: string;
  videoId: string;
  adType: AdType;
  startOffsetSeconds: number;
  durationSeconds: number | null;
  skipAfterSeconds: number | null;
  advertisement: {
    id: string;
    title: string;
    assetType: AssetType;
  };
};
