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
