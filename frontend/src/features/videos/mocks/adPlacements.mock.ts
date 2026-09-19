import { AdType } from '../../../constants/ad.constants';
import type { AdPlacement } from '../../../types/adPlacement.types';

/**
 * @description Placeholder ad placements for the visual-only Video details page - swapped for
 * real data once a placements endpoint exists. Counts here match each mock video's
 * `adPlacementCount` in `videos.mock.ts`.
 */
export const MOCK_AD_PLACEMENTS: AdPlacement[] = [
  {
    id: 'p1',
    videoId: '1',
    startOffsetSeconds: 0,
    durationSeconds: null,
    skipAfterSeconds: 5,
    advertisement: { id: 'a1', title: 'Diwali sale — 20% off', adType: AdType.PRE_ROLL },
  },
  {
    id: 'p2',
    videoId: '1',
    startOffsetSeconds: 45,
    durationSeconds: 10,
    skipAfterSeconds: null,
    advertisement: { id: 'a2', title: 'Free shipping banner', adType: AdType.BANNER_OVERLAY },
  },
  {
    id: 'p3',
    videoId: '1',
    startOffsetSeconds: 120,
    durationSeconds: null,
    skipAfterSeconds: null,
    advertisement: { id: 'a3', title: 'New arrivals teaser', adType: AdType.MID_ROLL },
  },
  {
    id: 'p4',
    videoId: '2',
    startOffsetSeconds: 0,
    durationSeconds: null,
    skipAfterSeconds: 5,
    advertisement: { id: 'a1', title: 'Diwali sale — 20% off', adType: AdType.PRE_ROLL },
  },
  {
    id: 'p5',
    videoId: '6',
    startOffsetSeconds: 90,
    durationSeconds: null,
    skipAfterSeconds: 5,
    advertisement: { id: 'a4', title: 'Weekly recap sponsor', adType: AdType.MID_ROLL },
  },
  {
    id: 'p6',
    videoId: '6',
    startOffsetSeconds: 20,
    durationSeconds: 15,
    skipAfterSeconds: null,
    advertisement: { id: 'a2', title: 'Free shipping banner', adType: AdType.BANNER_OVERLAY },
  },
];
