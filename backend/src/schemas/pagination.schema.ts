import { z } from 'zod';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants/pagination.constants';
import { ListView } from '../constants/listView.constants';

/**
 * @description Shared page/pageSize/search query validation for every paginated list endpoint -
 * coerced from query string values, with sane defaults and an upper bound on pageSize. search is
 * optional and trimmed - an empty/whitespace-only value is treated as "no search."
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  search: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
});

/**
 * @description Admin list query - pagination plus a `view` that switches the list from active
 * items (the default) to retired (soft-deleted) ones.
 */
export const adminListQuerySchema = paginationQuerySchema.extend({
  view: z.enum(ListView).default(ListView.ACTIVE),
});
