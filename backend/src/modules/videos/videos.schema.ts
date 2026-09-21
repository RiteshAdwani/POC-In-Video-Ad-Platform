import { z } from 'zod';
import {
  VIDEO_DESCRIPTION_MAX_LENGTH,
  VIDEO_TITLE_MAX_LENGTH,
} from '../../constants/videos.constants';

export const createVideoSchema = z.object({
  title: z.string().min(1).max(VIDEO_TITLE_MAX_LENGTH),
  description: z.string().max(VIDEO_DESCRIPTION_MAX_LENGTH).optional(),
});

// The video file itself isn't updatable - only its metadata. A new file is a new video.
export const updateVideoSchema = createVideoSchema.partial();
