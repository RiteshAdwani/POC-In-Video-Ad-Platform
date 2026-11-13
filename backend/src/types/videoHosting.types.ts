import type { VideoStatus } from '../generated/prisma/enums';
import type { FakeHostingOutcome } from '../constants/videoHosting.constants';

// What the host reports for one video: still transcoding, playable, or given up on.
export type VideoHostingStatus =
  | { status: typeof VideoStatus.PROCESSING }
  | { status: typeof VideoStatus.READY; playbackUrl: string; durationSeconds?: number }
  | { status: typeof VideoStatus.FAILED };

/**
 * The seam between the app and whoever hosts and transcodes video files. Every method may be
 * slow or throw - callers decide what a failure means for the video row.
 */
export interface VideoHostingService {
  // Hands the file to the host; resolves once it has an id, while transcoding carries on.
  initiateUpload(fileBuffer: Buffer): Promise<{ externalId: string }>;
  getStatus(externalId: string): Promise<VideoHostingStatus>;
  deleteVideo(externalId: string): Promise<void>;
}

// How the fake host behaves until reconfigured - see lib/fakeVideoHosting.ts.
export type FakeHostingBehavior = {
  uploadOutcome: FakeHostingOutcome;
  statusOutcome: FakeHostingOutcome;
  // What a status check that succeeds reports.
  reportedStatus: VideoStatus;
  // Added before every call resolves or throws - simulates a slow host.
  latencyMs: number;
};
