import type { Advertisement } from '../../generated/prisma/client.js';

type AdvertisementWithAdPlacementCount = Advertisement & { _count: { adPlacements: number } };

/**
 * @description Flattens Prisma's `_count.adPlacements` aggregate into the flat `adPlacementCount`
 * field the frontend actually consumes.
 */
export const toAdvertisementDto = ({
  _count,
  ...advertisement
}: AdvertisementWithAdPlacementCount) => ({
  ...advertisement,
  adPlacementCount: _count.adPlacements,
});
