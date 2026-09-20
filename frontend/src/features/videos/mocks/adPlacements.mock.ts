import { AdType, AssetType } from '../../../constants/ad.constants';
import type { AdPlacement } from '../../../types/adPlacement.types';

/**
 * @description Placeholder ad placements for the visual-only Video details page - swapped for
 * real data once a placements endpoint exists. Counts here match each mock video's
 * `adPlacementCount` in `videos.mock.ts`. Ad `a1` is placed as both a pre-roll (video `1`) and a
 * mid-roll (video `2`) - the same creative, two different placement roles.
 */
export const MOCK_AD_PLACEMENTS: AdPlacement[] = [
  {
    id: 'p1',
    videoId: '1',
    adType: AdType.PRE_ROLL,
    startOffsetSeconds: 0,
    durationSeconds: null,
    skipAfterSeconds: 5,
    advertisement: { id: 'a1', title: 'Diwali sale — 20% off', assetType: AssetType.VIDEO },
  },
  {
    id: 'p2',
    videoId: '1',
    adType: AdType.BANNER_OVERLAY,
    startOffsetSeconds: 45,
    durationSeconds: 10,
    skipAfterSeconds: null,
    advertisement: { id: 'a2', title: 'Free shipping banner', assetType: AssetType.IMAGE },
  },
  {
    id: 'p3',
    videoId: '1',
    adType: AdType.MID_ROLL,
    startOffsetSeconds: 120,
    durationSeconds: null,
    skipAfterSeconds: null,
    advertisement: { id: 'a3', title: 'New arrivals teaser', assetType: AssetType.VIDEO },
  },
  {
    id: 'p4',
    videoId: '2',
    adType: AdType.MID_ROLL,
    startOffsetSeconds: 30,
    durationSeconds: null,
    skipAfterSeconds: 5,
    advertisement: { id: 'a1', title: 'Diwali sale — 20% off', assetType: AssetType.VIDEO },
  },
  {
    id: 'p5',
    videoId: '6',
    adType: AdType.MID_ROLL,
    startOffsetSeconds: 90,
    durationSeconds: null,
    skipAfterSeconds: 5,
    advertisement: { id: 'a4', title: 'Weekly recap sponsor', assetType: AssetType.VIDEO },
  },
  {
    id: 'p6',
    videoId: '6',
    adType: AdType.BANNER_OVERLAY,
    startOffsetSeconds: 20,
    durationSeconds: 15,
    skipAfterSeconds: null,
    advertisement: { id: 'a2', title: 'Free shipping banner', assetType: AssetType.IMAGE },
  },
];
