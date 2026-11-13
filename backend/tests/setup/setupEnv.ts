import { VideoHostingProvider } from '../../src/constants/videoHosting.constants';
import { getTestDatabaseUrl } from './testDatabase';

// Runs in every test worker before the test file loads any app module - env.ts's own dotenv call
// never overrides a variable that's already set, so these win over the root .env.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = getTestDatabaseUrl();
process.env.VIDEO_HOSTING_PROVIDER = VideoHostingProvider.FAKE;
