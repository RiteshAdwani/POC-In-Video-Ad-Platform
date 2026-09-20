export const PlacementFormFields = {
  AdvertisementId: 'advertisementId',
  AdType: 'adType',
  StartOffsetSeconds: 'startOffsetSeconds',
  DurationSeconds: 'durationSeconds',
  SkipAfterSeconds: 'skipAfterSeconds',
} as const;

export type PlacementFormFields = (typeof PlacementFormFields)[keyof typeof PlacementFormFields];
