// Appended to the dev database's name - the tests truncate every table, so they get their own.
export const TEST_DATABASE_SUFFIX = '_test';

// Every table in this schema is emptied before each integration test, except Prisma's own record
// of applied migrations - wiping that would make the next run re-apply them all and fail.
export const TEST_DATABASE_SCHEMA = 'public';
export const TEST_MIGRATIONS_TABLE = '_prisma_migrations';

// Factory defaults - a READY two-minute video, so placements and events are valid against it.
export const TEST_VIDEO_DURATION_SECONDS = 120;
export const TEST_PLAYBACK_URL = 'https://fake-video-host.test/videos/ready.mp4';
export const TEST_IMAGE_ASSET_URL = 'https://fake-video-host.test/ads/banner.png';
export const TEST_VIDEO_ASSET_URL = 'https://fake-video-host.test/ads/spot.mp4';
export const TEST_CLICK_THROUGH_URL = 'https://advertiser.test/landing';

// Prisma's CLI entry, run with node directly - no shell and no PATH lookup for npx.
export const TEST_PRISMA_CLI_ENTRY = 'prisma/build/index.js';
export const TEST_MIGRATE_DEPLOY_ARGS = ['migrate', 'deploy'];

// Fixed ids for schema-only tests, where no row needs to exist.
export const TEST_VIDEO_ID = '11111111-1111-4111-8111-111111111111';
export const TEST_AD_ID = '22222222-2222-4222-8222-222222222222';

// Viewer sessions sending events - two, for "same event from different viewers" tests.
export const TEST_SESSION_ID = 'session-1';
export const TEST_OTHER_SESSION_ID = 'session-2';

// An id no row will ever have - for "doesn't exist" requests.
export const TEST_UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

// Endpoints the integration tests call.
export const TestApiPaths = {
  EVENTS: '/api/v1/public/events',
  DASHBOARD: '/api/v1/dashboard',
  VIDEOS: '/api/v1/videos',
  ADVERTISEMENTS: '/api/v1/advertisements',
  AGGREGATION: '/api/v1/aggregation',
} as const;

// How many identical events the concurrency test fires at once.
export const TEST_DUPLICATE_BURST_SIZE = 10;

// A fixed, already-closed day for aggregation tests, and an instant in the middle of it.
export const TEST_AGGREGATED_DAY = '2026-01-15';
export const TEST_AGGREGATED_DAY_NOON = new Date(`${TEST_AGGREGATED_DAY}T12:00:00.000Z`);
