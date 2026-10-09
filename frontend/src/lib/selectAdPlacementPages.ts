import type { InfiniteData } from '@tanstack/react-query';
import type { PaginationMeta } from '../types/pagination.types';

/**
 * @description `select` for the infinite placement lists - merges every loaded batch into one list,
 * with the total from the newest batch (the freshest count). Defined once, so TanStack Query can
 * skip re-running it on every render.
 */
export const selectAdPlacementPages = <TAdPlacement>(
  data: InfiniteData<{ adPlacements: TAdPlacement[]; pagination: PaginationMeta }, number>,
) => ({
  adPlacements: data.pages.flatMap((page) => page.adPlacements),
  totalItems: data.pages.at(-1)?.pagination.totalItems ?? 0,
});
