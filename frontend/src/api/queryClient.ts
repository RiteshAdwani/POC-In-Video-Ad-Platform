import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';
import { MAX_QUERY_RETRIES } from '../constants/queryClient.constants';

/**
 * @description Skips retrying any 4xx response (validation, auth, not-found, or a rate limit) -
 * none of these succeed on retry, and retrying one only piles more requests onto a backend that's
 * already rejecting them (seen concretely as a Render free-tier cold-start 429 burst getting
 * worse from the default retry storm). A network failure or a 5xx still gets the default retry.
 */
const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
    return false;
  }
  return failureCount < MAX_QUERY_RETRIES;
};

/**
 * @description The single TanStack Query client for the app, provided once at the root.
 */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: shouldRetryQuery } },
});
