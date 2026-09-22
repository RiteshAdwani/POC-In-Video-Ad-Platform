import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import type { RecordPlaybackEventRequestDto } from '../../../dtos/playback.dto';

/**
 * @description Sends one playback event via sendBeacon, not axios - a beacon's delivery is still
 * attempted if the tab is closing mid-send, which a normal HTTP call can't promise. Wrapped as a
 * mutation purely for a consistent calling convention; there's no response to reflect into cache.
 */
export const useRecordPlaybackEventMutation = () =>
  useMutation({
    mutationFn: async (event: RecordPlaybackEventRequestDto) => {
      const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
      const url = `${axiosInstance.defaults.baseURL}${ApiRoutes.recordPlaybackEvent()}`;
      navigator.sendBeacon(url, blob);
    },
  });
