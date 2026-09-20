// A placement's role on a specific video - not a property of the ad asset itself. The same video
// creative can be a pre-roll on one video and a mid-roll on another.
export const AdType = {
  PRE_ROLL: 'PRE_ROLL',
  MID_ROLL: 'MID_ROLL',
  BANNER_OVERLAY: 'BANNER_OVERLAY',
} as const;

export type AdType = (typeof AdType)[keyof typeof AdType];

export const AD_TYPE_LABEL: Record<AdType, string> = {
  [AdType.PRE_ROLL]: 'Pre-roll',
  [AdType.MID_ROLL]: 'Mid-roll',
  [AdType.BANNER_OVERLAY]: 'Banner overlay',
};

// What kind of file an ad's creative actually is - fixed for the asset's lifetime. A BANNER_OVERLAY
// placement requires an IMAGE asset; PRE_ROLL/MID_ROLL require a VIDEO asset.
export const AssetType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  [AssetType.IMAGE]: 'Image',
  [AssetType.VIDEO]: 'Video',
};
