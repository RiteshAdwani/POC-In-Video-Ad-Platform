import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../constants/pagination.constants';
import type { InfinitePaginatedQueryOptions, PaginationMeta } from '../types/pagination.types';

/**
 * @description The one way to fetch an infinite (scroll-to-load-more) list - hands queryFn the
 * next batch's ready-to-send query params, and stops once the last page has loaded. A search term
 * is part of the query key, so changing it starts the list over from page 1.
 */
export const useInfinitePaginatedQuery = <
  TData extends { pagination: PaginationMeta },
  TSelected = InfiniteData<TData, number>,
>({
  queryKey,
  queryFn,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  ...options
}: InfinitePaginatedQueryOptions<TData, TSelected>) =>
  useInfiniteQuery({
    queryKey: [...queryKey, search],
    queryFn: ({ pageParam }) => queryFn({ page: pageParam, pageSize, ...(search && { search }) }),
    initialPageParam: DEFAULT_PAGE,
    getNextPageParam: ({ pagination }) =>
      pagination.page < pagination.totalPages ? pagination.page + 1 : undefined,
    ...options,
  });
