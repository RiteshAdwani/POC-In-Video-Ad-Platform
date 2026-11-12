import { describe, expect, it } from 'vitest';
import { validatePlacementConstraints } from '../../src/modules/adPlacements/adPlacements.validators';
import { AdType, AssetType } from '../../src/generated/prisma/enums';
import { ValidationError } from '../../src/errors/AppError';
import { ErrorMessages } from '../../src/constants/errorMessages.constants';

describe('validatePlacementConstraints', () => {
  it('accepts a pre-roll video placement at offset 0', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.VIDEO, 120, {
        adType: AdType.PRE_ROLL,
        startOffsetSeconds: 0,
      }),
    ).not.toThrow();
  });

  it('accepts a mid-roll video placement strictly after 0', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.VIDEO, 120, {
        adType: AdType.MID_ROLL,
        startOffsetSeconds: 30,
      }),
    ).not.toThrow();
  });

  it('accepts a banner overlay with an image asset and a duration', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.IMAGE, 120, {
        adType: AdType.BANNER_OVERLAY,
        startOffsetSeconds: 10,
        durationSeconds: 5,
      }),
    ).not.toThrow();
  });

  it('rejects a video ad used as a banner overlay - banners show image ads only', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.VIDEO, 120, {
        adType: AdType.BANNER_OVERLAY,
        startOffsetSeconds: 10,
        durationSeconds: 5,
      }),
    ).toThrow(new ValidationError(ErrorMessages.AD_PLACEMENT_ASSET_TYPE_MISMATCH));
  });

  it('rejects an image ad used as a pre-roll or mid-roll - those play video ads only', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.IMAGE, 120, {
        adType: AdType.PRE_ROLL,
        startOffsetSeconds: 0,
      }),
    ).toThrow(new ValidationError(ErrorMessages.AD_PLACEMENT_ASSET_TYPE_MISMATCH));
    expect(() =>
      validatePlacementConstraints(AssetType.IMAGE, 120, {
        adType: AdType.MID_ROLL,
        startOffsetSeconds: 30,
      }),
    ).toThrow(new ValidationError(ErrorMessages.AD_PLACEMENT_ASSET_TYPE_MISMATCH));
  });

  it('rejects a pre-roll at a non-zero offset', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.VIDEO, 120, {
        adType: AdType.PRE_ROLL,
        startOffsetSeconds: 5,
      }),
    ).toThrow(new ValidationError(ErrorMessages.INVALID_PREROLL_OFFSET));
  });

  it('rejects a mid-roll at offset 0 (indistinguishable from a pre-roll)', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.VIDEO, 120, {
        adType: AdType.MID_ROLL,
        startOffsetSeconds: 0,
      }),
    ).toThrow(new ValidationError(ErrorMessages.INVALID_MIDROLL_OFFSET));
  });

  it('rejects a banner overlay with no duration', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.IMAGE, 120, {
        adType: AdType.BANNER_OVERLAY,
        startOffsetSeconds: 10,
        durationSeconds: undefined,
      }),
    ).toThrow(new ValidationError(ErrorMessages.MISSING_BANNER_DURATION));
  });

  it('rejects a banner overlay with a zero duration (falsy, same as missing)', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.IMAGE, 120, {
        adType: AdType.BANNER_OVERLAY,
        startOffsetSeconds: 10,
        durationSeconds: 0,
      }),
    ).toThrow(new ValidationError(ErrorMessages.MISSING_BANNER_DURATION));
  });

  it('accepts a skippable banner whose skip point lands before it ends', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.IMAGE, 120, {
        adType: AdType.BANNER_OVERLAY,
        startOffsetSeconds: 10,
        durationSeconds: 5,
        skipAfterSeconds: 2,
      }),
    ).not.toThrow();
  });

  it('rejects a banner whose skip point is at or after its own end', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.IMAGE, 120, {
        adType: AdType.BANNER_OVERLAY,
        startOffsetSeconds: 10,
        durationSeconds: 5,
        skipAfterSeconds: 5,
      }),
    ).toThrow(new ValidationError(ErrorMessages.SKIP_AFTER_EXCEEDS_BANNER_DURATION));
  });

  it('rejects a mid-roll starting at or after the video duration', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.VIDEO, 120, {
        adType: AdType.MID_ROLL,
        startOffsetSeconds: 120,
      }),
    ).toThrow(new ValidationError(ErrorMessages.PLACEMENT_OFFSET_EXCEEDS_VIDEO_DURATION));
  });

  it('rejects a banner overlay starting at or after the video duration', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.IMAGE, 120, {
        adType: AdType.BANNER_OVERLAY,
        startOffsetSeconds: 120,
        durationSeconds: 5,
      }),
    ).toThrow(new ValidationError(ErrorMessages.PLACEMENT_OFFSET_EXCEEDS_VIDEO_DURATION));
  });

  it('skips the length check entirely when the video has no known duration yet', () => {
    expect(() =>
      validatePlacementConstraints(AssetType.VIDEO, null, {
        adType: AdType.MID_ROLL,
        startOffsetSeconds: 999999,
      }),
    ).not.toThrow();
  });
});
