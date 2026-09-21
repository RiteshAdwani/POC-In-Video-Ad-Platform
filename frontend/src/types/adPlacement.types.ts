import type { AdType, AssetType } from '../constants/ad.constants';
import type { Video } from './video.types';

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

/**
 * @description One placement as returned by the ad-scoped placements endpoint - the video it's on
 * instead of the advertisement it already belongs to, for an ad's "Placed on" list.
 */
export type AdPlacementWithVideo = Pick<
  AdPlacement,
  'id' | 'adType' | 'startOffsetSeconds' | 'durationSeconds' | 'skipAfterSeconds'
> & { video: Video };
