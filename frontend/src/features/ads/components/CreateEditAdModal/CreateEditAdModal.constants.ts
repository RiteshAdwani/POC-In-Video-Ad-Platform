export const AdFormFields = {
  Title: 'title',
  Description: 'description',
  AssetFile: 'assetFile',
  ClickThroughUrl: 'clickThroughUrl',
} as const;

export type AdFormFields = (typeof AdFormFields)[keyof typeof AdFormFields];

// Shared by the Form rule (CreateEditAdModal.rules.ts) and the input's own `maxLength` prop, so
// the two can't drift apart.
export const AD_TITLE_MAX_LENGTH = 150;
export const AD_DESCRIPTION_MAX_LENGTH = 500;
