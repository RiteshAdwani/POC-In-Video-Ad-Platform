import { env } from '../config/env';
import { VideoHostingProvider } from '../constants/videoHosting.constants';
import type { VideoHostingService } from '../types/videoHosting.types';
import { cloudinaryVideoHosting } from './cloudinaryVideoHosting';
import { fakeVideoHosting } from './fakeVideoHosting';

// The one host every video upload, status check and delete goes through - Cloudinary unless
// VIDEO_HOSTING_PROVIDER says otherwise (the automated tests run against the fake).
export const videoHosting: VideoHostingService =
  env.VIDEO_HOSTING_PROVIDER === VideoHostingProvider.FAKE
    ? fakeVideoHosting
    : cloudinaryVideoHosting;
