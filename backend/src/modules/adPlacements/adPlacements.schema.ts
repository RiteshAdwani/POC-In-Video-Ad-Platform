import { z } from 'zod';
import { AdType } from '../../generated/prisma/enums';

export const createAdPlacementSchema = z.object({
  advertisementId: z.uuid(),
  adType: z.enum(AdType),
  startOffsetSeconds: z.number().int().nonnegative(),
  durationSeconds: z.number().int().positive().optional(),
  skipAfterSeconds: z.number().int().nonnegative().optional(),
});

export const updateAdPlacementSchema = createAdPlacementSchema
  .omit({ advertisementId: true })
  .partial();
