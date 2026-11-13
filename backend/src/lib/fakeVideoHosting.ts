import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { VideoStatus } from '../generated/prisma/enums';
import type { FakeHostingBehavior, VideoHostingStatus } from '../types/videoHosting.types';
import {
  DEFAULT_FAKE_HOSTING_BEHAVIOR,
  FAKE_DURATION_SECONDS,
  FAKE_EXTERNAL_ID_PREFIX,
  FAKE_HOSTING_ERROR_MESSAGE,
  FAKE_HOSTING_UNAVAILABLE_MESSAGE,
  FAKE_PLAYBACK_URL,
  FakeHostingOutcome,
} from '../constants/videoHosting.constants';

let behavior: FakeHostingBehavior = { ...DEFAULT_FAKE_HOSTING_BEHAVIOR };

// Every call the app made, in order - lets a test assert what was (or wasn't) sent to the host.
const calls = {
  uploads: 0,
  statusChecks: [] as string[],
  deletes: [] as string[],
};

/**
 * @description Waits out the configured latency, then throws if this call is set to fail -
 * the same two ways a real host misbehaves: slowly, or not at all.
 */
const simulateHost = async (outcome: FakeHostingOutcome) => {
  if (behavior.latencyMs > 0) {
    await sleep(behavior.latencyMs);
  }
  if (outcome === FakeHostingOutcome.ERROR) {
    throw new Error(FAKE_HOSTING_ERROR_MESSAGE);
  }
  if (outcome === FakeHostingOutcome.UNAVAILABLE) {
    throw new Error(FAKE_HOSTING_UNAVAILABLE_MESSAGE);
  }
};

/**
 * @description A deterministic stand-in for the real host, so tests can make it slow, erroring or
 * unavailable on demand. configure() changes how later calls behave; reset() restores a healthy,
 * instant host and clears the call log.
 */
export const fakeVideoHosting = {
  initiateUpload: async () => {
    calls.uploads += 1;
    await simulateHost(behavior.uploadOutcome);
    return { externalId: `${FAKE_EXTERNAL_ID_PREFIX}${randomUUID()}` };
  },

  getStatus: async (externalId: string): Promise<VideoHostingStatus> => {
    calls.statusChecks.push(externalId);
    await simulateHost(behavior.statusOutcome);

    if (behavior.reportedStatus === VideoStatus.READY) {
      return {
        status: VideoStatus.READY,
        playbackUrl: FAKE_PLAYBACK_URL,
        durationSeconds: FAKE_DURATION_SECONDS,
      };
    }
    return { status: behavior.reportedStatus };
  },

  deleteVideo: async (externalId: string) => {
    calls.deletes.push(externalId);
    await simulateHost(FakeHostingOutcome.SUCCEED);
  },

  configure: (overrides: Partial<FakeHostingBehavior>) => {
    behavior = { ...behavior, ...overrides };
  },

  reset: () => {
    behavior = { ...DEFAULT_FAKE_HOSTING_BEHAVIOR };
    calls.uploads = 0;
    calls.statusChecks.length = 0;
    calls.deletes.length = 0;
  },

  calls,
};
