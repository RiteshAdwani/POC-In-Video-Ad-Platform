import { z } from 'zod';

export const dashboardQuerySchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    videoId: z.uuid().optional(),
    adPlacementId: z.uuid().optional(),
  })
  .refine((query) => query.startDate <= query.endDate, {
    path: ['endDate'],
    message: 'endDate must not be before startDate',
  })
  .refine((query) => !query.adPlacementId || query.videoId, {
    path: ['adPlacementId'],
    message: 'adPlacementId requires videoId',
  });
