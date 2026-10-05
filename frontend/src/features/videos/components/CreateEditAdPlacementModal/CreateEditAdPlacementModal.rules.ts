import type { FormRule } from 'antd';
import { AdType } from '../../../../constants/ad.constants';
import { ValidationMessages } from '../../../../constants/validationMessages.constants';
import { AdPlacementFormFields } from './CreateEditAdPlacementModal.constants';

/**
 * @description The largest valid start offset for a mid-roll/banner placement - undefined when
 * the type doesn't have an upper bound or the video's duration isn't known yet. Exported so the
 * form's help text and input can agree with the rule below instead of each computing it again.
 */
export const getMaxStartOffsetSeconds = (
  adType: AdType | undefined,
  videoDurationSeconds: number | null | undefined,
): number | undefined => {
  const applies = adType === AdType.MID_ROLL || adType === AdType.BANNER_OVERLAY;
  return applies && videoDurationSeconds != null ? Math.ceil(videoDurationSeconds) - 1 : undefined;
};

/**
 * @description Field-level validation for the create/edit placement form - mirrors the backend's
 * per-adType rules, including the start-offset upper bound against the video's own duration
 * (skipped until that duration is known) and, for a banner, the skip-after upper bound against its
 * own duration field (skipped until that's typed in).
 */
export const getAdPlacementFormRules = (
  adType: AdType | undefined,
  videoDurationSeconds: number | null | undefined,
  bannerDurationSeconds?: number | null,
): Record<AdPlacementFormFields, FormRule[]> => {
  const startOffsetRules: FormRule[] =
    adType === AdType.MID_ROLL
      ? [
          { required: true, message: ValidationMessages.required('a start offset') },
          { type: 'number', min: 1, message: ValidationMessages.min('Start offset', 1) },
        ]
      : [
          { required: true, message: ValidationMessages.required('a start offset') },
          { type: 'number', min: 0, message: ValidationMessages.min('Start offset', 0) },
        ];

  const maxStartOffsetSeconds = getMaxStartOffsetSeconds(adType, videoDurationSeconds);
  if (maxStartOffsetSeconds !== undefined) {
    startOffsetRules.push({
      type: 'number',
      max: maxStartOffsetSeconds,
      message: ValidationMessages.max('Start offset', maxStartOffsetSeconds),
    });
  }

  const skipAfterRules: FormRule[] = [
    { type: 'number', min: 0, message: ValidationMessages.min('Skip-after', 0) },
  ];
  if (adType === AdType.BANNER_OVERLAY && bannerDurationSeconds != null) {
    const maxSkipAfterSeconds = bannerDurationSeconds - 1;
    skipAfterRules.push({
      type: 'number',
      max: maxSkipAfterSeconds,
      message: ValidationMessages.max('Skip-after', maxSkipAfterSeconds),
    });
  }

  return {
    [AdPlacementFormFields.AdvertisementId]: [
      { required: true, message: ValidationMessages.required('an ad') },
    ],
    [AdPlacementFormFields.AdType]: [
      { required: true, message: ValidationMessages.required('a placement type') },
    ],
    [AdPlacementFormFields.StartOffsetSeconds]: startOffsetRules,
    [AdPlacementFormFields.DurationSeconds]:
      adType === AdType.BANNER_OVERLAY
        ? [
            { required: true, message: ValidationMessages.required('a duration') },
            { type: 'number', min: 1, message: ValidationMessages.min('Duration', 1) },
          ]
        : [],
    [AdPlacementFormFields.SkipAfterSeconds]: skipAfterRules,
  };
};
