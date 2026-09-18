import { QueryClient } from '@tanstack/react-query';

/**
 * @description The single TanStack Query client for the app, provided once at the root.
 */
export const queryClient = new QueryClient();
