import type { AssetType } from '../constants/ad.constants';

export type Advertisement = {
  id: string;
  title: string;
  description: string | null;
  assetType: AssetType;
  assetUrl: string;
  clickThroughUrl: string | null;
  adPlacementCount: number;
  createdAt: string;
};
