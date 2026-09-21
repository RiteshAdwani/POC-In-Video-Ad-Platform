import type { AdType } from '../constants/ad.constants';
import type { AdPlacement, AdPlacementWithVideo } from '../types/adPlacement.types';

export type CreateAdPlacementRequestDto = {
  advertisementId: string;
  adType: AdType;
  startOffsetSeconds: number;
  durationSeconds?: number;
  skipAfterSeconds?: number;
};

export type UpdateAdPlacementRequestDto = Partial<
  Omit<CreateAdPlacementRequestDto, 'advertisementId'>
>;

export type AdPlacementResponseDto = { adPlacement: AdPlacement };
export type AdPlacementsResponseDto = { adPlacements: AdPlacement[] };
export type AdPlacementsForAdResponseDto = { adPlacements: AdPlacementWithVideo[] };
