import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { useInfinitePaginatedQuery } from '../../../hooks/useInfinitePaginatedQuery';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { PublicVideosResponseDto } from '../../../dtos/playback.dto';

/**
 * @description Fetches READY videos for the public catalog landing page, one page at a time,
 * optionally filtered by a title search term - no auth, no ownership scoping, unlike the admin
 * videos list. Loads further pages as the catalog is scrolled (fetchNextPage), rather than the
 * admin lists' numbered pagination - this is a browse/discovery feed, not a "find this specific
 * item" management task. Changing `search` starts a fresh query (a new query key), which is
 * exactly the reset-to-page-1 behavior wanted when the search term changes.
 */
export const usePublicVideosQuery = (search: string) =>
  useInfinitePaginatedQuery({
    queryKey: [QueryKeys.PUBLIC_VIDEOS],
    search,
    queryFn: async (params) => {
      const response = await axiosInstance.get<ApiResponseBody<PublicVideosResponseDto>>(
        ApiRoutes.getPublicVideos(),
        { params },
      );
      return response.data.data;
    },
  });
