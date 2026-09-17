import { z } from 'zod';
import { AdType } from '../../generated/prisma/enums';

export const createAdvertisementSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  adType: z.enum(AdType),
  assetUrl: z.url(),
  clickThroughUrl: z.url().optional(),
});

export const updateAdvertisementSchema = createAdvertisementSchema.partial();
