import { z } from 'zod';
import {
  AD_DESCRIPTION_MAX_LENGTH,
  AD_TITLE_MAX_LENGTH,
  CLICK_THROUGH_URL_PROTOCOL,
} from '../../constants/ads.constants';

export const createAdvertisementSchema = z.object({
  title: z.string().min(1).max(AD_TITLE_MAX_LENGTH),
  description: z.string().max(AD_DESCRIPTION_MAX_LENGTH).optional(),
  clickThroughUrl: z.url({ protocol: CLICK_THROUGH_URL_PROTOCOL }).nullable().optional(),
});

export const updateAdvertisementSchema = createAdvertisementSchema.partial();
