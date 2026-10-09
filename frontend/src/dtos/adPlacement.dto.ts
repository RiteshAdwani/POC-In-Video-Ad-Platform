import type { AdType } from '../constants/ad.constants';
import type { AdPlacement, AdPlacementWithVideo } from '../types/adPlacement.types';
import type { PaginationMeta } from '../types/pagination.types';

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
export type AdPlacementsResponseDto = { adPlacements: AdPlacement[]; pagination: PaginationMeta };
export type AdPlacementsForAdResponseDto = {
  adPlacements: AdPlacementWithVideo[];
  pagination: PaginationMeta;
};
