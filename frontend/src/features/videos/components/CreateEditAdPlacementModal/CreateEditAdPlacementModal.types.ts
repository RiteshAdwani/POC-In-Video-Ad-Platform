import type { AdType } from '../../../../constants/ad.constants';
import { AdPlacementFormFields } from './CreateEditAdPlacementModal.constants';

export type AdPlacementFormType = {
  [AdPlacementFormFields.AdvertisementId]: string;
  [AdPlacementFormFields.AdType]: AdType;
  [AdPlacementFormFields.StartOffsetSeconds]: number;
  [AdPlacementFormFields.DurationSeconds]?: number | null;
  [AdPlacementFormFields.SkipAfterSeconds]?: number | null;
};
