import { AdType, AD_TYPE_LABEL } from '../../../../constants/ad.constants';

export const AdFormFields = {
  Title: 'title',
  Description: 'description',
  AdType: 'adType',
  AssetFile: 'assetFile',
  ClickThroughUrl: 'clickThroughUrl',
} as const;

export type AdFormFields = (typeof AdFormFields)[keyof typeof AdFormFields];

export const AD_TYPE_OPTIONS: { value: AdType; label: string }[] = [
  { value: AdType.PRE_ROLL, label: AD_TYPE_LABEL[AdType.PRE_ROLL] },
  { value: AdType.MID_ROLL, label: AD_TYPE_LABEL[AdType.MID_ROLL] },
  { value: AdType.BANNER_OVERLAY, label: AD_TYPE_LABEL[AdType.BANNER_OVERLAY] },
];

// Shared by the Form rule (CreateEditAdModal.rules.ts) and the input's own `maxLength` prop, so
// the two can't drift apart.
export const AD_TITLE_MAX_LENGTH = 150;
export const AD_DESCRIPTION_MAX_LENGTH = 500;
