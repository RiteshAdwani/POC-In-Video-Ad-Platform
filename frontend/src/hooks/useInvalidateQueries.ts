import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { QueryKeys } from '../constants/queryKeys.constants';

/**
 * @description Marks stale every query whose key contains any of the given segments, so they
 * refetch. Fire-and-forget - mutations don't wait on the refetch, and queries surface their own errors.
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (queryKeys: QueryKeys[]) => {
      queryKeys.forEach((queryKey) =>
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.includes(queryKey),
        }),
      );
    },
    [queryClient],
  );
};
