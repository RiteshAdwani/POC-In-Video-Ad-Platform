import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_PARAM } from '../constants/pagination.constants';
import { SEARCH_PARAM } from '../constants/search.constants';
import type { PaginatedQueryOptions, PaginationMeta } from '../types/pagination.types';

/**
 * @description The one way to fetch a page-level paginated list - keeps its page, search term, and
 * filters in the URL (surviving a refresh, shareable), hands queryFn them as ready-to-send query
 * params, refetches whenever any of them change, and steps back to the last real page when the
 * current one stops existing.
 */
export const usePaginatedQuery = <
  TData extends { pagination: PaginationMeta },
  TFilters extends Record<string, string> = Record<string, never>,
>({
  queryKey,
  queryFn,
  defaultFilters = {} as TFilters,
  pageSize = DEFAULT_PAGE_SIZE,
  ...options
}: PaginatedQueryOptions<TData, TFilters>) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawPage = Number(searchParams.get(PAGE_PARAM));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
  const search = searchParams.get(SEARCH_PARAM) ?? '';
  const filters = Object.fromEntries(
    Object.entries(defaultFilters).map(([key, fallback]) => [
      key,
      searchParams.get(key) ?? fallback,
    ]),
  ) as TFilters;

  // Sent as the request's query params as-is - a blank search is left out.
  const requestParams = { page, pageSize, ...(search && { search }), ...filters };

  const query = useQuery({
    queryKey: [...queryKey, page, search, filters],
    queryFn: () => queryFn(requestParams),
    ...options,
  });

  // Writes all the given params in one update (an empty value drops its param), replacing
  // history - paging shouldn't pile up back-button entries.
  const updateParams = useCallback(
    (updates: Record<string, string>) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) =>
            value ? next.set(key, value) : next.delete(key),
          );
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  // Memoized - it's the clamp effect's dependency below.
  const onPageChange = useCallback(
    (nextPage: number) => updateParams({ [PAGE_PARAM]: String(nextPage) }),
    [updateParams],
  );

  // Changing what's listed restarts it from page 1, in the same update - one refetch.
  const onSearch = (nextSearch: string) =>
    updateParams({ [SEARCH_PARAM]: nextSearch, [PAGE_PARAM]: '' });

  const onFilterChange = (changes: Partial<TFilters>) =>
    updateParams({ ...(changes as Record<string, string>), [PAGE_PARAM]: '' });

  const totalPages = query.data?.pagination.totalPages;

  /**
   * @description Steps back to the last real page when the current one no longer exists - e.g.
   * after removing the only item on the last page - instead of leaving an empty page showing.
   */
  useEffect(() => {
    if (totalPages && page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  return { ...query, page, search, filters, onPageChange, onSearch, onFilterChange };
};
