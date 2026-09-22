import { formatDuration } from './formatDuration';

type TimedAdPlacement = {
  durationSeconds: number | null;
  skipAfterSeconds: number | null;
};

/**
 * @description One placement has either a duration (banners) or a skip-after point (skippable
 * video ads) or neither (non-skippable video ads) - never both, per the backend's own model.
 */
export const formatDurationOrSkip = (adPlacement: TimedAdPlacement) => {
  if (adPlacement.durationSeconds !== null) {
    return `${formatDuration(adPlacement.durationSeconds)} long`;
  }
  if (adPlacement.skipAfterSeconds !== null) {
    return `Skippable after ${adPlacement.skipAfterSeconds}s`;
  }
  return 'Not skippable';
};
