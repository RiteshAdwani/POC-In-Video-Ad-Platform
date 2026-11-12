// Appended to the dev database's name - the tests truncate every table, so they get their own.
export const TEST_DATABASE_SUFFIX = '_test';

// Every table in this schema is emptied before each integration test, except Prisma's own record
// of applied migrations - wiping that would make the next run re-apply them all and fail.
export const APP_SCHEMA = 'public';
export const PRISMA_MIGRATIONS_TABLE = '_prisma_migrations';

// Factory defaults - a READY two-minute video, so placements and events are valid against it.
export const TEST_VIDEO_DURATION_SECONDS = 120;
export const TEST_PLAYBACK_URL = 'https://fake-video-host.test/videos/ready.mp4';
export const TEST_IMAGE_ASSET_URL = 'https://fake-video-host.test/ads/banner.png';
export const TEST_VIDEO_ASSET_URL = 'https://fake-video-host.test/ads/spot.mp4';
export const TEST_CLICK_THROUGH_URL = 'https://advertiser.test/landing';

// Prisma's CLI entry, run with node directly - no shell and no PATH lookup for npx.
export const PRISMA_CLI_ENTRY = 'prisma/build/index.js';
export const PRISMA_MIGRATE_DEPLOY_ARGS = ['migrate', 'deploy'];
