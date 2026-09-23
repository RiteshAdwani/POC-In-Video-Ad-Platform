import { z } from 'zod';

export const triggerAggregationRunSchema = z.object({
  day: z.coerce.date(),
});
