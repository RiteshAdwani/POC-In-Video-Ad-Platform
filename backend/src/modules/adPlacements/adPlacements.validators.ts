import { AdType, AssetType } from '../../generated/prisma/client.js';
import { ValidationError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';

/**
 * @description Enforces the placement rules: a banner overlay needs an image asset (it has no
 * natural end the way a video ad does, hence the required duration), a pre/mid-roll needs a video
 * asset, and pre-roll is always at offset 0 (there's nowhere else for it to go).
 */
export const validatePlacementConstraints = (
  assetType: AssetType,
  {
    adType,
    startOffsetSeconds,
    durationSeconds,
  }: { adType: AdType; startOffsetSeconds: number; durationSeconds?: number | null },
): void => {
  const expectsImage = adType === AdType.BANNER_OVERLAY;
  const isImage = assetType === AssetType.IMAGE;

  if (expectsImage !== isImage) {
    throw new ValidationError(ErrorMessages.PLACEMENT_ASSET_TYPE_MISMATCH);
  }
  if (adType === AdType.PRE_ROLL && startOffsetSeconds !== 0) {
    throw new ValidationError(ErrorMessages.INVALID_PREROLL_OFFSET);
  }
  if (adType === AdType.BANNER_OVERLAY && !durationSeconds) {
    throw new ValidationError(ErrorMessages.MISSING_BANNER_DURATION);
  }
};
