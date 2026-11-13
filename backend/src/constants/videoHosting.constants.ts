import { VideoStatus } from '../generated/prisma/enums';
import type { FakeHostingBehavior } from '../types/videoHosting.types';

// Which VideoHostingService implementation the app runs against - picked by VIDEO_HOSTING_PROVIDER.
export const VideoHostingProvider = {
  CLOUDINARY: 'cloudinary',
  FAKE: 'fake',
} as const;

export type VideoHostingProvider = (typeof VideoHostingProvider)[keyof typeof VideoHostingProvider];

// How the fake's next call behaves. ERROR is the host rejecting the request; UNAVAILABLE is the
// host not answering at all (connection refused) - both throw, with different messages.
export const FakeHostingOutcome = {
  SUCCEED: 'succeed',
  ERROR: 'error',
  UNAVAILABLE: 'unavailable',
} as const;

export type FakeHostingOutcome = (typeof FakeHostingOutcome)[keyof typeof FakeHostingOutcome];

// What the fake reports for a status check that succeeds.
export const FAKE_PLAYBACK_URL = 'https://fake-video-host.test/videos/sample.mp4';
export const FAKE_DURATION_SECONDS = 120;
export const FAKE_EXTERNAL_ID_PREFIX = 'fake-video-';
export const FAKE_HOSTING_ERROR_MESSAGE = 'Fake video host rejected the request';
export const FAKE_HOSTING_UNAVAILABLE_MESSAGE = 'connect ECONNREFUSED fake-video-host.test';

// The fake's starting behavior - a healthy, instant host whose videos are ready straight away.
export const DEFAULT_FAKE_HOSTING_BEHAVIOR: FakeHostingBehavior = {
  uploadOutcome: FakeHostingOutcome.SUCCEED,
  statusOutcome: FakeHostingOutcome.SUCCEED,
  reportedStatus: VideoStatus.READY,
  latencyMs: 0,
};
