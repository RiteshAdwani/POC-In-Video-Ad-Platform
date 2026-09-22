import { AdType, AD_TYPE_LABEL, AssetType } from '../../../../constants/ad.constants';

export const AdPlacementFormFields = {
  AdvertisementId: 'advertisementId',
  AdType: 'adType',
  StartOffsetSeconds: 'startOffsetSeconds',
  DurationSeconds: 'durationSeconds',
  SkipAfterSeconds: 'skipAfterSeconds',
} as const;

export type AdPlacementFormFields =
  (typeof AdPlacementFormFields)[keyof typeof AdPlacementFormFields];

export const AD_TYPE_OPTIONS_BY_ASSET_TYPE: Record<AssetType, { value: AdType; label: string }[]> =
  {
    [AssetType.IMAGE]: [
      { value: AdType.BANNER_OVERLAY, label: AD_TYPE_LABEL[AdType.BANNER_OVERLAY] },
    ],
    [AssetType.VIDEO]: [
      { value: AdType.PRE_ROLL, label: AD_TYPE_LABEL[AdType.PRE_ROLL] },
      { value: AdType.MID_ROLL, label: AD_TYPE_LABEL[AdType.MID_ROLL] },
    ],
  };
