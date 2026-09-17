import { z } from 'zod';

export const createAdPlacementSchema = z.object({
  advertisementId: z.uuid(),
  startOffsetSeconds: z.number().int().nonnegative(),
  durationSeconds: z.number().int().positive().optional(),
  skipAfterSeconds: z.number().int().nonnegative().optional(),
});

export const updateAdPlacementSchema = createAdPlacementSchema
  .omit({ advertisementId: true })
  .partial();
