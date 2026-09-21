import type { Advertisement } from '../../generated/prisma/client.js';

type AdvertisementWithPlacementCount = Advertisement & { _count: { adPlacements: number } };

/**
 * @description Flattens Prisma's `_count.adPlacements` aggregate into the flat `placementCount`
 * field the frontend actually consumes.
 */
export const toAdvertisementDto = ({
  _count,
  ...advertisement
}: AdvertisementWithPlacementCount) => ({
  ...advertisement,
  placementCount: _count.adPlacements,
});
