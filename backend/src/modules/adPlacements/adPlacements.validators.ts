import { AdType } from '../../generated/prisma/client.js';
import { ValidationError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';

/**
 * @description Enforces the per-adType placement rules: pre-roll is always at offset 0 (there's
 * nowhere else for it to go), and a banner needs a duration since it has no natural end the way
 * a video ad does (which just plays for the creative's own length).
 */
export const validatePlacementConstraints = (
  adType: AdType,
  {
    startOffsetSeconds,
    durationSeconds,
  }: { startOffsetSeconds: number; durationSeconds?: number | null },
): void => {
  if (adType === AdType.PRE_ROLL && startOffsetSeconds !== 0) {
    throw new ValidationError(ErrorMessages.INVALID_PREROLL_OFFSET);
  }
  if (adType === AdType.BANNER_OVERLAY && !durationSeconds) {
    throw new ValidationError(ErrorMessages.MISSING_BANNER_DURATION);
  }
};
