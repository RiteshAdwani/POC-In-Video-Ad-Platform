import path from 'node:path';
import dotenv from 'dotenv';
import { TEST_DATABASE_SUFFIX } from './test.constants';

/**
 * @description The dev DATABASE_URL from the root .env, pointed at a sibling `<name>_test`
 * database on the same Postgres server.
 */
export const getTestDatabaseUrl = (): string => {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set in the root .env to run the tests');
  }

  const url = new URL(databaseUrl);
  const databaseName = url.pathname.slice(1);
  if (!databaseName.endsWith(TEST_DATABASE_SUFFIX)) {
    url.pathname = `/${databaseName}${TEST_DATABASE_SUFFIX}`;
  }
  return url.toString();
};
