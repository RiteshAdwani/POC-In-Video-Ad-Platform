import type { FormRule } from 'antd';
import { AdType } from '../../../../constants/ad.constants';
import { ValidationMessages } from '../../../../constants/validationMessages.constants';
import { AdPlacementFormFields } from './CreateEditAdPlacementModal.constants';

/**
 * @description Field-level validation for the create/edit placement form - depends on the
 * selected ad's type, mirroring the backend's own per-adType placement rules
 * (adPlacements.validators.ts): a banner overlay needs a duration since it has no natural end,
 * everything else doesn't use one, and a mid-roll must start after 0 (offset 0 is reserved for
 * pre-roll - the field is otherwise disabled and locked to 0 there).
 */
export const getAdPlacementFormRules = (
  adType: AdType | undefined,
): Record<AdPlacementFormFields, FormRule[]> => ({
  [AdPlacementFormFields.AdvertisementId]: [
    { required: true, message: ValidationMessages.required('an ad') },
  ],
  [AdPlacementFormFields.AdType]: [
    { required: true, message: ValidationMessages.required('a placement type') },
  ],
  [AdPlacementFormFields.StartOffsetSeconds]:
    adType === AdType.MID_ROLL
      ? [
          { required: true, message: ValidationMessages.required('a start offset') },
          { type: 'number', min: 1, message: ValidationMessages.min('Start offset', 1) },
        ]
      : [
          { required: true, message: ValidationMessages.required('a start offset') },
          { type: 'number', min: 0, message: ValidationMessages.min('Start offset', 0) },
        ],
  [AdPlacementFormFields.DurationSeconds]:
    adType === AdType.BANNER_OVERLAY
      ? [
          { required: true, message: ValidationMessages.required('a duration') },
          { type: 'number', min: 1, message: ValidationMessages.min('Duration', 1) },
        ]
      : [],
  [AdPlacementFormFields.SkipAfterSeconds]: [
    { type: 'number', min: 0, message: ValidationMessages.min('Skip-after', 0) },
  ],
});
