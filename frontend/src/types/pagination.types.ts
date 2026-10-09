import type { QueryKey, UseInfiniteQueryOptions, UseQueryOptions } from '@tanstack/react-query';

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

// What a paginated list's queryFn receives - ready to send as the request's query params.
export type PaginatedQueryParams<TFilters> = {
  page: number;
  pageSize: number;
  search?: string;
} & TFilters;

export type PaginatedQueryOptions<TData, TFilters> = Omit<
  UseQueryOptions<TData>,
  'queryKey' | 'queryFn'
> & {
  queryKey: QueryKey;
  queryFn: (params: PaginatedQueryParams<TFilters>) => Promise<TData>;
  // Every filter the list reads from the URL, with the value used while its param is absent. Named
  // after the API's own query params, so they're sent as-is.
  defaultFilters?: TFilters;
  pageSize?: number;
};

export type InfinitePaginatedQueryOptions<TData, TSelected> = Omit<
  UseInfiniteQueryOptions<TData, Error, TSelected, QueryKey, number>,
  'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
> & {
  queryKey: QueryKey;
  queryFn: (params: PaginatedQueryParams<object>) => Promise<TData>;
  pageSize?: number;
  search?: string;
};
