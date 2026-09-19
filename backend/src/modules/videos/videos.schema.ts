import { z } from 'zod';
import {
  VIDEO_DESCRIPTION_MAX_LENGTH,
  VIDEO_TITLE_MAX_LENGTH,
} from '../../constants/videos.constants';

export const createVideoSchema = z.object({
  title: z.string().min(1).max(VIDEO_TITLE_MAX_LENGTH),
  description: z.string().max(VIDEO_DESCRIPTION_MAX_LENGTH).optional(),
});
