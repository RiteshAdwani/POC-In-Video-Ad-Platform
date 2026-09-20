import type { AdType } from '../../../../constants/ad.constants';
import { PlacementFormFields } from './CreateEditPlacementModal.constants';

export type PlacementFormType = {
  [PlacementFormFields.AdvertisementId]: string;
  [PlacementFormFields.AdType]: AdType;
  [PlacementFormFields.StartOffsetSeconds]: number;
  [PlacementFormFields.DurationSeconds]?: number | null;
  [PlacementFormFields.SkipAfterSeconds]?: number | null;
};
