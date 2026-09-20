import { AssetType } from '../../../constants/ad.constants';
import type { Advertisement } from '../../../types/advertisement.types';

// Same cc0-licensed sample used for mock video playback - stands in for a real video creative.
const MOCK_VIDEO_ASSET_URL =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

/**
 * @description Placeholder rows for the visual-only Ads page - swapped for `useAdsQuery`'s real
 * data once it's wired up. `placementCount` is a mock-only convenience field (mirroring
 * `Video.adPlacementCount`) - the real list endpoint doesn't return it.
 */
export const MOCK_ADS: Advertisement[] = [
  {
    id: 'a1',
    title: 'Diwali sale — 20% off',
    description:
      'Video spot for the Diwali storewide sale - reused as both a pre-roll and a mid-roll.',
    assetType: AssetType.VIDEO,
    assetUrl: MOCK_VIDEO_ASSET_URL,
    clickThroughUrl: 'https://example.com/diwali-sale',
    placementCount: 2,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'a2',
    title: 'Free shipping banner',
    description: 'Persistent banner overlay promoting free shipping over ₹999.',
    assetType: AssetType.IMAGE,
    assetUrl: 'https://placehold.co/600x150/png?text=Free+Shipping',
    clickThroughUrl: 'https://example.com/shipping',
    placementCount: 2,
    createdAt: '2026-08-20T09:30:00Z',
  },
  {
    id: 'a3',
    title: 'New arrivals teaser',
    description: null,
    assetType: AssetType.VIDEO,
    assetUrl: MOCK_VIDEO_ASSET_URL,
    clickThroughUrl: null,
    placementCount: 1,
    createdAt: '2026-09-12T15:45:00Z',
  },
  {
    id: 'a4',
    title: 'Weekly recap sponsor',
    description: 'Sponsor read for the weekly recap series.',
    assetType: AssetType.VIDEO,
    assetUrl: MOCK_VIDEO_ASSET_URL,
    clickThroughUrl: 'https://example.com/sponsor',
    placementCount: 1,
    createdAt: '2026-08-25T12:00:00Z',
  },
];
