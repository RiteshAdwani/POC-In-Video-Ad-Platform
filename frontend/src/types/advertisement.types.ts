import type { AdType } from '../constants/ad.constants';

export type Advertisement = {
  id: string;
  title: string;
  description: string | null;
  adType: AdType;
  assetUrl: string;
  clickThroughUrl: string | null;
  placementCount: number;
  createdAt: string;
};
