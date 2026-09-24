import type { Advertisement } from '../types/advertisement.types';

export type UpdateAdvertisementRequestDto = {
  title?: string;
  description?: string;
  clickThroughUrl?: string | null;
};

export type AdvertisementResponseDto = { advertisement: Advertisement };
export type AdvertisementsResponseDto = { advertisements: Advertisement[] };
